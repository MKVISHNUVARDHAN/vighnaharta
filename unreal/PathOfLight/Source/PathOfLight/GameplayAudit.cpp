#include "TailLab.h"
#include "Engine/World.h"
#include "HAL/IConsoleManager.h"
#include "HAL/PlatformMisc.h"
#include "Kismet/GameplayStatics.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"

// Opt-in, disposable-process regression checks against the actual runtime actors.
// Run with -PathOfLightAudit -ExecCmds="PathOfLight.Audit" -nullrhi -unattended.
#if !UE_BUILD_SHIPPING
static void RunGameplayAudit(UWorld* World)
{
    if (!FParse::Param(FCommandLine::Get(), TEXT("PathOfLightAudit"))) return;
    int32 Failures = 0;
    auto Check = [&](bool Passed, const TCHAR* Label) {
        UE_LOG(LogTemp, Display, TEXT("GAMEPLAY_AUDIT %s: %s"), Passed ? TEXT("PASS") : TEXT("FAIL"), Label);
        if (!Passed) ++Failures;
    };
    auto* Game = World ? Cast<ALightGameMode>(World->GetAuthGameMode()) : nullptr;
    auto* Runner = World ? Cast<ALightRunner>(UGameplayStatics::GetPlayerPawn(World, 0)) : nullptr;
    if (!Game || !Runner)
    {
        Check(false, TEXT("Playable world and possessed runner exist"));
        FPlatformMisc::RequestExitWithStatus(false, 1);
        return;
    }
    Check(!Game->bRunning, TEXT("Initial load waits at menu"));
    Check(FGameAssets::RoadStraight && FGameAssets::SolidMat && FGameAssets::RoadMat,
        TEXT("Road and shared materials load in this build"));
    Check(FGameAssets::Mooshak && FGameAssets::AstraVajra && FGameAssets::AstraTrident && FGameAssets::AstraChakra,
        TEXT("Hero and all Astra meshes load"));
    Game->StartRun();
    Runner->bAutoFire = false;
    for (ALightMagicBolt* Bolt : Game->Bolts) if (Bolt) Bolt->Deactivate();
    Runner->FireCooldown = 0.f;
    Runner->SelectWeapon(EWeaponType::Vajra);
    Runner->FireMagic();
    Runner->FireMagic();
    int32 Active = 0;
    for (ALightMagicBolt* Bolt : Game->Bolts) if (Bolt && Bolt->bActive) ++Active;
    Check(Active == 1 && Runner->FireCooldown > 0.f, TEXT("Repeated manual input obeys cooldown"));
    Runner->SelectWeapon(EWeaponType::Brahmastra);
    Runner->FireMagic();
    int32 AfterSwitch = 0;
    for (ALightMagicBolt* Bolt : Game->Bolts) if (Bolt && Bolt->bActive) ++AfterSwitch;
    Check(AfterSwitch == Active, TEXT("Weapon switching cannot bypass cooldown"));
    Game->bPaused = true;
    Runner->FireCooldown = 0.f;
    Runner->FireMagic();
    int32 AfterPause = 0;
    for (ALightMagicBolt* Bolt : Game->Bolts) if (Bolt && Bolt->bActive) ++AfterPause;
    Check(AfterPause == Active, TEXT("Paused state blocks casts"));
    Game->bPaused = false;
    for (ALightMagicBolt* Bolt : Game->Bolts) if (Bolt) Bolt->Deactivate();

    ALightProp* FarBrute = nullptr;
    for (ALightProp* Prop : Game->Props)
        if (Prop && Prop->MoveSpeed != 0.f && Prop->Home.X > 20000.f) { FarBrute = Prop; break; }
    if (FarBrute)
    {
        const FVector Before = FarBrute->GetActorLocation();
        FarBrute->Tick(1.f);
        Check(FarBrute->GetActorLocation().Equals(Before), TEXT("Distant encounter waits for player"));
    }
    else Check(false, TEXT("Distant charging encounter exists"));

    auto* Target = World->SpawnActor<ALightProp>();
    Target->Configure(ETailKind::Brute, FVector(200000.f, 0, 80), FVector(1));
    Target->Health = 20;
    Game->Props.Add(Target);
    auto* Bolt = Game->Bolts[0].Get();
    Bolt->Launch(FVector(199400.f, 0, 80), FVector::ForwardVector, EWeaponType::Vajra, 1);
    Bolt->Tick(0.1f); // 1,250 cm in one frame: endpoint is beyond the target.
    Check(Target->Health == 18, TEXT("10 FPS projectile sweep hits crossed enemy"));
    Bolt->Deactivate();
    Bolt->Launch(FVector(199900.f, 0, 80), FVector::ForwardVector, EWeaponType::Vajra, 1);
    Bolt->Tick(0.001f);
    Bolt->Tick(0.001f);
    Check(Target->Health == 16, TEXT("One hit per target per launch; pooled hit history resets"));
    Bolt->Deactivate();
    Bolt->Launch(FVector(199400.f, 0, 80), FVector::ForwardVector, EWeaponType::Brahmastra, 1);
    Bolt->Tick(0.2f);
    Check(Target->Health == 6, TEXT("Low FPS blast resolves at crossed target, not overshot endpoint"));
    Game->Chain = 6;
    Game->Flow = 4;
    Game->Score = 0;
    Game->ChariotDistance = 65.f;
    const int32 BeforeKills = Game->ObstaclesBlasted;
    Target->TakeMagicDamage(10, Runner);
    Target->TakeMagicDamage(10, Runner);
    Check(Game->Score == 400, TEXT("Kill multiplier applies once"));
    Check(Game->ObstaclesBlasted == BeforeKills + 1, TEXT("Defeated enemy rewards exactly once"));
    Check(Game->ChariotDistance > 65.f, TEXT("Successful hit cannot reduce a large Rath gap"));
    Check(!Target->IsActorTickEnabled(), TEXT("Cleared enemies stop ticking"));

    Game->bRunning = false;
    auto* Untouched = World->SpawnActor<ALightProp>();
    Untouched->Configure(ETailKind::Brute, FVector(210000.f, 0, 80), FVector(1));
    Game->Props.Add(Untouched);
    Bolt->Launch(FVector(209400.f, 0, 80), FVector::ForwardVector, EWeaponType::Vajra, 1);
    Bolt->Tick(0.1f);
    Check(Untouched->Health == 3, TEXT("Projectiles cannot alter completed/menu world"));
    UE_LOG(LogTemp, Display, TEXT("GAMEPLAY_AUDIT COMPLETE: %d failures"), Failures);
    FPlatformMisc::RequestExitWithStatus(false, Failures ? 1 : 0);
}

static FAutoConsoleCommandWithWorld GameplayAuditCommand(
    TEXT("PathOfLight.Audit"), TEXT("Run isolated runtime regression checks; requires -PathOfLightAudit."),
    FConsoleCommandWithWorldDelegate::CreateStatic(&RunGameplayAudit));
#endif
