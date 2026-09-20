#include "TailLab.h"
#include "Camera/CameraComponent.h"
#include "Engine/Canvas.h"
#include "Components/AudioComponent.h"
#include "Components/CapsuleComponent.h"
#include "Components/DirectionalLightComponent.h"
#include "Components/ExponentialHeightFogComponent.h"
#include "Components/InputComponent.h"
#include "Components/LightComponent.h"
#include "Components/PointLightComponent.h"
#include "Components/SceneComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/DirectionalLight.h"
#include "Engine/ExponentialHeightFog.h"
#include "Engine/PointLight.h"
#include "Engine/PostProcessVolume.h"
#include "Engine/SkyLight.h"
#include "Engine/TextureCube.h"
#include "Components/SkyAtmosphereComponent.h"
#include "Components/SkyLightComponent.h"
#include "Sound/SoundBase.h"
#include "Engine/StaticMesh.h"
#include "Engine/StaticMeshActor.h"
#include "Engine/World.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/PlayerController.h"
#include "GameFramework/SpringArmComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "NiagaraFunctionLibrary.h"
#include "NiagaraSystem.h"
#include "TimerManager.h"
#include "UObject/ConstructorHelpers.h"

static ALightGameMode* Mode(const AActor* Actor)
{
    return Actor ? Cast<ALightGameMode>(UGameplayStatics::GetGameMode(Actor)) : nullptr;
}

static bool IsEngineShape(UStaticMesh* Shape)
{
    if (!Shape) return true;
    const FString Path = Shape->GetPathName();
    return Path.Contains(TEXT("/Engine/BasicShapes/"));
}

static UMaterialInstanceDynamic* Tint(UPrimitiveComponent* Mesh, const FLinearColor& Color, float Glow = 0.f, bool bForce = false)
{
    if (!Mesh) return nullptr;
    if (!bForce)
    {
        if (UStaticMeshComponent* StaticMesh = Cast<UStaticMeshComponent>(Mesh))
        {
            if (!IsEngineShape(StaticMesh->GetStaticMesh())) return nullptr;
        }
    }
    UMaterialInterface* Base = FGameAssets::SolidMat;
    if (!Base) Base = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/Materials/M_Solid.M_Solid"));
    if (!Base) Base = Mesh->GetMaterial(0);
    if (!Base) return nullptr;
    UMaterialInstanceDynamic* Mid = Cast<UMaterialInstanceDynamic>(Mesh->GetMaterial(0));
    if (!Mid)
    {
        Mid = UMaterialInstanceDynamic::Create(Base, Mesh);
        Mesh->SetMaterial(0, Mid);
    }
    Mid->SetVectorParameterValue(TEXT("Color"), Color);
    Mid->SetVectorParameterValue(TEXT("BaseColor"), Color);
    Mid->SetScalarParameterValue(TEXT("Glow"), Glow);
    Mid->SetVectorParameterValue(TEXT("EmissiveColor"), Color * Glow);
    return Mid;
}

bool FGameAssets::bLoaded = false;
UStaticMesh* FGameAssets::Mooshak = nullptr;
UStaticMesh* FGameAssets::RoadStraight = nullptr;
UStaticMesh* FGameAssets::AstraVajra = nullptr;
UStaticMesh* FGameAssets::AstraTrident = nullptr;
UStaticMesh* FGameAssets::AstraChakra = nullptr;
UStaticMesh* FGameAssets::GunAK47 = nullptr;
UStaticMesh* FGameAssets::GunFlamethrower = nullptr;
UStaticMesh* FGameAssets::GunRocketLauncher = nullptr;
UStaticMesh* FGameAssets::GunShotgun = nullptr;
UStaticMesh* FGameAssets::AsuraMinion = nullptr;
UStaticMesh* FGameAssets::AsuraBrute = nullptr;
UStaticMesh* FGameAssets::AsuraFiend = nullptr;
UStaticMesh* FGameAssets::AsuraGate = nullptr;
UStaticMesh* FGameAssets::Rath = nullptr;
UStaticMesh* FGameAssets::Ganesha = nullptr;
UStaticMesh* FGameAssets::DropShadowMesh = nullptr;
UMaterialInterface* FGameAssets::SolidMat = nullptr;
UMaterialInterface* FGameAssets::RoadMat = nullptr;

void FGameAssets::EnsureLoaded()
{
    if (bLoaded) return;
    bLoaded = true;

    auto LoadMesh = [](const TCHAR* Path) -> UStaticMesh* {
        UStaticMesh* M = LoadObject<UStaticMesh>(nullptr, Path);
        if (M) M->AddToRoot();
        return M;
    };
    auto LoadMat = [](const TCHAR* Path) -> UMaterialInterface* {
        UMaterialInterface* Mat = LoadObject<UMaterialInterface>(nullptr, Path);
        if (Mat) Mat->AddToRoot();
        return Mat;
    };

    Mooshak = LoadMesh(TEXT("/Game/Hero/Mooshak.Mooshak"));
    if (!Mooshak) Mooshak = LoadMesh(TEXT("/Game/Hero/Rat.Rat"));

    RoadStraight = LoadMesh(TEXT("/Game/Roads/RoadStraight.RoadStraight"));

    AstraVajra = LoadMesh(TEXT("/Game/Astras/AstraVajra.AstraVajra"));
    AstraTrident = LoadMesh(TEXT("/Game/Astras/AstraTrident.AstraTrident"));
    AstraChakra = LoadMesh(TEXT("/Game/Astras/AstraChakra.AstraChakra"));

    GunAK47 = LoadMesh(TEXT("/Game/Weapons/AK47.blaster-a"));
    GunFlamethrower = LoadMesh(TEXT("/Game/Weapons/Flamethrower.Flamethrower"));
    GunRocketLauncher = LoadMesh(TEXT("/Game/Weapons/RocketLauncher.RocketLauncher"));
    GunShotgun = LoadMesh(TEXT("/Game/Weapons/Shotgun.blaster-d"));

    AsuraMinion = LoadMesh(TEXT("/Game/Demons/AsuraMinion.AsuraMinion"));
    AsuraBrute = LoadMesh(TEXT("/Game/Demons/AsuraBrute.AsuraBrute"));
    AsuraFiend = LoadMesh(TEXT("/Game/Demons/AsuraFiend.AsuraFiend"));
    AsuraGate = LoadMesh(TEXT("/Game/Demons/AsuraGate.AsuraGate"));

    Rath = LoadMesh(TEXT("/Game/Rath/Rath.Rath"));
    Ganesha = LoadMesh(TEXT("/Game/Rath/GaneshaIdol.GaneshaIdol"));
    DropShadowMesh = LoadMesh(TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));

    SolidMat = LoadMat(TEXT("/Game/Materials/M_Solid.M_Solid"));
    RoadMat = LoadMat(TEXT("/Game/Roads/M_Road_Straight.M_Road_Straight"));
}

static UStaticMesh* CubeMesh()
{
    static UStaticMesh* M = nullptr;
    if (!M) { M = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Cube.Cube")); if (M) M->AddToRoot(); }
    return M;
}
static UStaticMesh* SphereMesh()
{
    static UStaticMesh* M = nullptr;
    if (!M) { M = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Sphere.Sphere")); if (M) M->AddToRoot(); }
    return M;
}
static UStaticMesh* CylinderMesh()
{
    static UStaticMesh* M = nullptr;
    if (!M) { M = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Cylinder.Cylinder")); if (M) M->AddToRoot(); }
    return M;
}
static UStaticMesh* KayKit(const TCHAR* Name)
{
    const FString Path = FString::Printf(TEXT("/Game/KayKit/%s.%s"), Name, Name);
    static TMap<FString, UStaticMesh*> KKCache;
    if (UStaticMesh** Found = KKCache.Find(Path)) return *Found;
    UStaticMesh* M = LoadObject<UStaticMesh>(nullptr, *Path);
    if (M) { M->AddToRoot(); KKCache.Add(Path, M); }
    return M;
}
static UStaticMesh* CityMesh(const TCHAR* Name)
{
    const FString Path = FString::Printf(TEXT("/Game/City/%s.%s"), Name, Name);
    static TMap<FString, UStaticMesh*> CityCache;
    if (UStaticMesh** Found = CityCache.Find(Path)) return *Found;
    UStaticMesh* M = LoadObject<UStaticMesh>(nullptr, *Path);
    if (M) { M->AddToRoot(); CityCache.Add(Path, M); }
    return M;
}
static UStaticMesh* FestMesh(const TCHAR* Name) { return CityMesh(Name); }
static UStaticMesh* RathMesh() { FGameAssets::EnsureLoaded(); return FGameAssets::Rath; }
static UStaticMesh* GaneshaMesh() { FGameAssets::EnsureLoaded(); return FGameAssets::Ganesha; }
static UStaticMesh* RoadblockMesh() { return CityMesh(TEXT("RoadblockGate")); }
static UStaticMesh* CitizenMesh() { return CityMesh(TEXT("Citizen")); }
static UStaticMesh* AsuraMinionMesh() { FGameAssets::EnsureLoaded(); return FGameAssets::AsuraMinion; }
static UStaticMesh* AsuraBruteMesh() { FGameAssets::EnsureLoaded(); return FGameAssets::AsuraBrute; }
static UStaticMesh* AsuraFiendMesh() { FGameAssets::EnsureLoaded(); return FGameAssets::AsuraFiend; }
static UStaticMesh* AsuraGateMesh() { FGameAssets::EnsureLoaded(); return FGameAssets::AsuraGate; }
static UStaticMesh* MooshakMesh() { FGameAssets::EnsureLoaded(); return FGameAssets::Mooshak; }
static UStaticMesh* AstraVajraMesh() { FGameAssets::EnsureLoaded(); return FGameAssets::AstraVajra; }
static UStaticMesh* AstraTridentMesh() { FGameAssets::EnsureLoaded(); return FGameAssets::AstraTrident; }
static UStaticMesh* AstraChakraMesh() { FGameAssets::EnsureLoaded(); return FGameAssets::AstraChakra; }

static void Dress(UStaticMeshComponent* Part, UStaticMesh* Shape, FVector Rel, FVector Scale, const FLinearColor& Color, float Glow = 0.f)
{
    if (!Part || !Shape) return;
    Part->SetStaticMesh(Shape);
    Part->SetRelativeLocation(Rel);
    Part->SetRelativeScale3D(Scale);
    Part->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Part->SetVisibility(true);
    Tint(Part, Color, Glow);
}

static AStaticMeshActor* Block(UWorld* World, FVector Position, FVector Scale, const FLinearColor& Color, UStaticMesh* Shape = nullptr, bool bForceTint = false)
{
    auto* Actor = World->SpawnActor<AStaticMeshActor>(Position, FRotator::ZeroRotator);
    Actor->SetMobility(EComponentMobility::Movable);
    Actor->GetStaticMeshComponent()->SetStaticMesh(Shape ? Shape : CubeMesh());
    Actor->SetActorScale3D(Scale);
    if (!Shape || bForceTint || Shape == CubeMesh() || Shape == SphereMesh() || Shape == CylinderMesh())
    {
        Tint(Actor->GetStaticMeshComponent(), Color);
    }
    return Actor;
}

static void SpawnStall(UWorld* World, FVector Position, FLinearColor Cloth, bool Flip)
{
    const float Side = Flip ? 1.f : -1.f;
    Block(World, Position, FVector(3.2f, 2.2f, 2.4f), FLinearColor(0.42f, 0.24f, 0.12f), KayKit(TEXT("building_A")));
    UStaticMesh* AwningMesh = CityMesh(TEXT("detail_awning"));
    auto* Awning = Block(World, Position + FVector(0, Side * 140.f, 120.f), FVector(2.4f), Cloth, AwningMesh ? AwningMesh : CubeMesh());
    Awning->SetActorEnableCollision(false);
    Block(World, Position + FVector(-80, Side * 40.f, 30), FVector(0.6f, 0.6f, 0.6f), FLinearColor(0.55f, 0.32f, 0.14f), KayKit(TEXT("box_A")));
    Block(World, Position + FVector(90, Side * 50.f, 20), FVector(0.7f, 0.5f, 0.5f), FLinearColor(0.2f, 0.45f, 0.22f), KayKit(TEXT("bush")));
}

static void SpawnDiya(ALightGameMode* Game, FVector Position, float Intensity)
{
    if (!Game || !Game->GetWorld()) return;
    // Cap active dynamic point lights to keep laptop GPU cool and smooth
    if (Game->Lamps.Num() < 16)
    {
        auto* Lamp = Game->GetWorld()->SpawnActor<APointLight>(Position, FRotator::ZeroRotator);
        if (Lamp && Lamp->PointLightComponent)
        {
            Lamp->PointLightComponent->SetIntensity(FMath::Min(Intensity, 1500.f));
            Lamp->PointLightComponent->SetLightColor(FLinearColor(1.f, 0.72f, 0.28f));
            Lamp->PointLightComponent->SetAttenuationRadius(450.f);
            Lamp->PointLightComponent->SetCastShadows(false);
            Game->Lamps.Add(Lamp);
        }
    }
    UStaticMesh* Diya = CityMesh(TEXT("candle_lit"));
    auto* Flame = Block(Game->GetWorld(), Position, FVector(1.1f), FLinearColor(1.f, 0.78f, 0.22f), Diya ? Diya : SphereMesh(), true);
    Flame->SetActorEnableCollision(false);
}

ALightSpark::ALightSpark()
{
    PrimaryActorTick.bCanEverTick = true;
    Mesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Spark"));
    SetRootComponent(Mesh);
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Sphere(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    Mesh->SetStaticMesh(Sphere.Object);
    Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Mesh->SetCastShadow(false);
    SetActorHiddenInGame(true);
    SetActorEnableCollision(false);
}

void ALightSpark::Launch(FVector Pos, FVector Velocity, FLinearColor Color, float Seconds)
{
    SetActorLocation(Pos);
    SetActorHiddenInGame(false);
    Vel = Velocity; Life = Seconds; MaxLife = FMath::Max(0.05f, Seconds);
    Mesh->SetWorldScale3D(FVector(0.18f));
    Tint(Mesh, Color, 2.2f);
}

void ALightSpark::Tick(float Delta)
{
    Super::Tick(Delta);
    if (Life <= 0.f) { SetActorHiddenInGame(true); return; }
    Life -= Delta;
    Vel.Z -= 1800.f * Delta;
    SetActorLocation(GetActorLocation() + Vel * Delta);
    const float T = FMath::Clamp(Life / MaxLife, 0.f, 1.f);
    Mesh->SetWorldScale3D(FVector(0.08f + 0.16f * T));
    if (Life <= 0.f) SetActorHiddenInGame(true);
}

ALightMagicBolt::ALightMagicBolt()
{
    PrimaryActorTick.bCanEverTick = true;
    PrimaryActorTick.bStartWithTickEnabled = false;
    Mesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("BoltMesh"));
    SetRootComponent(Mesh);
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Sphere(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    Mesh->SetStaticMesh(Sphere.Object);
    Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Mesh->SetCastShadow(false);
    Light = CreateDefaultSubobject<UPointLightComponent>(TEXT("BoltLight"));
    Light->SetupAttachment(Mesh);
    Light->SetAttenuationRadius(450.f);
    Light->SetCastShadows(false);
    SetActorHiddenInGame(true);
}

void ALightMagicBolt::Launch(FVector StartPos, FVector Dir, EWeaponType InWeapon, int32 InTier)
{
    SetActorLocation(StartPos);
    SetActorRotation(FRotationMatrix::MakeFromX(Dir).Rotator());
    SetActorHiddenInGame(false);
    WeaponType = InWeapon;
    Tier = FMath::Clamp(InTier, 1, 4);
    HitTargets.Reset();
    SetActorTickEnabled(true);
    bActive = true;
    if (Light) Light->SetVisibility(true);
    Life = 0.f;
    SpinAngle = 0.f;

    if (WeaponType == EWeaponType::Vajra)
    {
        // Indra's Vajra: High velocity electric divine lightning spear
        MaxLife = 0.65f;
        PierceLeft = 3;
        BlastRadius = 0.f;
        Velocity = Dir.GetSafeNormal() * 13500.f;
        UStaticMesh* VMesh = FGameAssets::AstraVajra ? FGameAssets::AstraVajra : FGameAssets::GunAK47;
        Mesh->SetStaticMesh(VMesh);
        Mesh->SetRelativeRotation(FRotator(90.f, 0, 0));
        float VMeshSize = VMesh ? VMesh->GetBoundingBox().GetSize().GetMax() : 100.f;
        float BoltScale = (VMeshSize > 1.f) ? (80.f / VMeshSize) : 0.85f;
        Mesh->SetWorldScale3D(FVector(BoltScale, BoltScale, BoltScale * 1.4f));
        Tint(Mesh, FLinearColor(0.2f, 0.85f, 1.0f), 8.f, true);
        if (Light) { Light->SetLightColor(FLinearColor(0.2f, 0.9f, 1.0f)); Light->SetIntensity(14000.f); Light->SetAttenuationRadius(600.f); }
    }
    else if (WeaponType == EWeaponType::Trishul)
    {
        // Shiva's Agni Trishul: Holy fire flaming trident projectile
        MaxLife = 0.75f;
        PierceLeft = 2;
        BlastRadius = 180.f;
        Velocity = Dir.GetSafeNormal() * 9200.f;
        UStaticMesh* TMesh = FGameAssets::AstraTrident ? FGameAssets::AstraTrident : FGameAssets::GunShotgun;
        Mesh->SetStaticMesh(TMesh);
        Mesh->SetRelativeRotation(FRotator(90.f, 0, 0));
        float TMeshSize = TMesh ? TMesh->GetBoundingBox().GetSize().GetMax() : 100.f;
        float BoltScale = (TMeshSize > 1.f) ? (90.f / TMeshSize) : 0.95f;
        Mesh->SetWorldScale3D(FVector(BoltScale, BoltScale, BoltScale * 1.2f));
        Tint(Mesh, FLinearColor(1.0f, 0.50f, 0.05f), 9.f, true);
        if (Light) { Light->SetLightColor(FLinearColor(1.0f, 0.5f, 0.05f)); Light->SetIntensity(16000.f); Light->SetAttenuationRadius(650.f); }
    }
    else if (WeaponType == EWeaponType::Chakra)
    {
        // Vishnu's Sudarshana Chakra: Spinning razor-sharp solar disc
        MaxLife = 0.85f;
        PierceLeft = 5;
        BlastRadius = 150.f;
        Velocity = Dir.GetSafeNormal() * 11000.f;
        UStaticMesh* CMesh = FGameAssets::AstraChakra ? FGameAssets::AstraChakra : FGameAssets::GunRocketLauncher;
        Mesh->SetStaticMesh(CMesh);
        Mesh->SetRelativeRotation(FRotator::ZeroRotator);
        float CMeshSize = CMesh ? CMesh->GetBoundingBox().GetSize().GetMax() : 100.f;
        float BoltScale = (CMeshSize > 1.f) ? (95.f / CMeshSize) : 1.0f;
        Mesh->SetWorldScale3D(FVector(BoltScale, BoltScale, BoltScale * 0.4f));
        Tint(Mesh, FLinearColor(1.0f, 0.88f, 0.15f), 10.f, true);
        if (Light) { Light->SetLightColor(FLinearColor(1.0f, 0.9f, 0.2f)); Light->SetIntensity(18000.f); Light->SetAttenuationRadius(700.f); }
    }
    else // Brahmastra
    {
        // Celestial Brahmastra: Giant solar orb with 750-radius obliterating shockwave
        MaxLife = 1.35f;
        PierceLeft = 8;
        BlastRadius = 750.f;
        Velocity = Dir.GetSafeNormal() * 6800.f;
        UStaticMesh* CMesh = FGameAssets::AstraChakra ? FGameAssets::AstraChakra : FGameAssets::GunFlamethrower;
        Mesh->SetStaticMesh(CMesh);
        Mesh->SetRelativeRotation(FRotator::ZeroRotator);
        float CMeshSize = CMesh ? CMesh->GetBoundingBox().GetSize().GetMax() : 100.f;
        float BoltScale = (CMeshSize > 1.f) ? (140.f / CMeshSize) : 1.5f;
        Mesh->SetWorldScale3D(FVector(BoltScale));
        Tint(Mesh, FLinearColor(1.5f, 1.3f, 0.6f), 14.f, true);
        if (Light) { Light->SetLightColor(FLinearColor(1.0f, 0.95f, 0.5f)); Light->SetIntensity(26000.f); Light->SetAttenuationRadius(950.f); }
    }
}

void ALightMagicBolt::Deactivate()
{
    bActive = false;
    SetActorTickEnabled(false);
    SetActorHiddenInGame(true);
    if (Light) Light->SetVisibility(false);
}

void ALightMagicBolt::Tick(float Delta)
{
    Super::Tick(Delta);
    if (!bActive || !Mode(this) || !Mode(this)->bRunning || Mode(this)->bPaused) return;

    if (WeaponType == EWeaponType::Chakra || WeaponType == EWeaponType::Brahmastra)
    {
        SpinAngle += Delta * 1400.f;
        SetActorRotation(FRotationMatrix::MakeFromX(Velocity).Rotator() + FRotator(0, 0, SpinAngle));
        // Solar sparkle trail
        if (FMath::FRand() < FMath::Min(1.f, Delta * 27.f) && Mode(this))
        {
            FLinearColor SparkCol = (WeaponType == EWeaponType::Brahmastra) ? FLinearColor(1.0f, 0.95f, 0.4f) : FLinearColor(1.0f, 0.85f, 0.2f);
            Mode(this)->Burst(1, GetActorLocation(), SparkCol, 80.f);
        }
    }
    else if (WeaponType == EWeaponType::Vajra)
    {
        if (FMath::FRand() < FMath::Min(1.f, Delta * 21.f) && Mode(this))
        {
            Mode(this)->Burst(1, GetActorLocation(), FLinearColor(0.2f, 0.85f, 1.0f), 70.f);
        }
    }
    else if (WeaponType == EWeaponType::Trishul)
    {
        if (FMath::FRand() < FMath::Min(1.f, Delta * 21.f) && Mode(this))
        {
            Mode(this)->Burst(1, GetActorLocation(), FLinearColor(1.0f, 0.45f, 0.05f), 70.f);
        }
    }

    if (Life >= MaxLife)
    {
        if (BlastRadius > 0.f && Mode(this))
        {
            auto* Game = Mode(this);
            Game->PlayCue(TEXT("/Game/Audio/rocket_boom.rocket_boom"), 1.0f);
            Game->PlayFX(Game->FXBoom, GetActorLocation(), 1.1f);
            Game->PlayFX(Game->FXBurst, GetActorLocation(), 0.9f);
            Game->Juice(1.4f, 30, GetActorLocation(), FLinearColor(1.0f, 0.85f, 0.2f));
            auto* Runner = Game->CachedRunner ? Game->CachedRunner.Get() : Cast<ALightRunner>(UGameplayStatics::GetPlayerPawn(this, 0));
            for (ALightProp* Prop : Game->Props)
            {
                if (!IsValid(Prop) || Prop->bCleared) continue;
                const FVector PLoc = Prop->GetActorLocation();
                if (FMath::Abs(PLoc.X - GetActorLocation().X) > BlastRadius) continue;
                if (FVector::DistSquared(GetActorLocation(), PLoc) < FMath::Square(BlastRadius))
                {
                    Prop->TakeMagicDamage(WeaponType == EWeaponType::Brahmastra ? 10 : 3, Runner);
                }
            }
        }
        Deactivate();
        return;
    }

    const FVector CurPos = GetActorLocation();
    const FVector NextPos = CurPos + Velocity * FMath::Min(Delta, MaxLife - Life);
    Life += Delta;

    auto* Game = Mode(this);
    if (Game)
    {
        auto* Runner = Game->CachedRunner ? Game->CachedRunner.Get() : Cast<ALightRunner>(UGameplayStatics::GetPlayerPawn(this, 0));
        TArray<ALightProp*> Candidates;
        for (ALightProp* Prop : Game->Props)
        {
            if (!IsValid(Prop) || Prop->bCleared || HitTargets.Contains(Prop)) continue;
            const FVector PLoc = Prop->GetActorLocation();
            if (FMath::Abs(PLoc.X - CurPos.X) > 2500.f && FMath::Abs(PLoc.X - NextPos.X) > 2500.f) continue;
            if (FMath::Abs(PLoc.Y - CurPos.Y) > 800.f) continue;
            const float Radius = Prop->bGate ? 380.f : 200.f;
            if (FMath::PointDistToSegmentSquared(PLoc, CurPos, NextPos) < FMath::Square(Radius))
                Candidates.Add(Prop);
        }
        Candidates.Sort([&](const ALightProp& A, const ALightProp& B) {
            return FVector::DotProduct(A.GetActorLocation() - CurPos, Velocity) <
                FVector::DotProduct(B.GetActorLocation() - CurPos, Velocity);
        });
        for (ALightProp* Prop : Candidates)
        {
            if (!IsValid(Prop) || Prop->bCleared) continue;
            const FVector PropPos = Prop->GetActorLocation();
            if (HitTargets.Contains(Prop)) continue;
            const float DistSq = FMath::PointDistToSegmentSquared(PropPos, CurPos, NextPos);
            const float HitRadius = Prop->bGate ? 380.f : 200.f;
            if (DistSq < FMath::Square(HitRadius))
            {
                HitTargets.Add(Prop);
                if (WeaponType == EWeaponType::Brahmastra)
                {
                    const FVector ImpactPos = FMath::ClosestPointOnSegment(PropPos, CurPos, NextPos);
                    Game->PlayCue(TEXT("/Game/Audio/rocket_boom.rocket_boom"), 1.0f);
                    Game->PlayFX(Game->FXBoom, ImpactPos, 1.3f);
                    Game->PlayFX(Game->FXBurst, ImpactPos, 1.0f);
                    Game->Juice(1.5f, 40, ImpactPos, FLinearColor(1.0f, 0.95f, 0.3f));
                    for (ALightProp* TargetProp : Game->Props)
                    {
                        if (!IsValid(TargetProp) || TargetProp->bCleared) continue;
                        const FVector TLoc = TargetProp->GetActorLocation();
                        if (FMath::Abs(TLoc.X - ImpactPos.X) > BlastRadius) continue;
                        if (FVector::DistSquared(ImpactPos, TLoc) < FMath::Square(BlastRadius))
                        {
                            TargetProp->TakeMagicDamage(10, Runner);
                        }
                    }
                    Deactivate();
                    return;
                }
                else
                {
                    const int32 Dmg = (WeaponType == EWeaponType::Trishul) ? 3 : 2;
                    Prop->TakeMagicDamage(Dmg, Runner);
                    PierceLeft--;
                    if (PierceLeft <= 0)
                    {
                        Deactivate();
                        return;
                    }
                }
            }
        }
    }
    SetActorLocation(NextPos);
}

ALightPowerUp::ALightPowerUp()
{
    PrimaryActorTick.bCanEverTick = true;
    USceneComponent* Root = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
    SetRootComponent(Root);
    Mesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("PowerMesh"));
    Mesh->SetupAttachment(Root);
    Ring = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("PowerRing"));
    Ring->SetupAttachment(Root);
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Sphere(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Cylinder(TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
    Mesh->SetStaticMesh(Sphere.Object);
    Ring->SetStaticMesh(Cylinder.Object);
    Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Ring->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Mesh->SetCastShadow(false);
    Ring->SetCastShadow(false);
    Light = CreateDefaultSubobject<UPointLightComponent>(TEXT("PowerLight"));
    Light->SetupAttachment(Root);
    Light->SetAttenuationRadius(550.f);
    Light->SetCastShadows(false);
}

void ALightPowerUp::Configure(EPowerUpType InType, FVector Pos)
{
    FGameAssets::EnsureLoaded();
    Type = InType;
    BasePos = Pos;
    SetActorLocation(Pos);
    bCollected = false;
    SetActorHiddenInGame(false);

    if (Type == EPowerUpType::WeaponVajra)
    {
        Mesh->SetStaticMesh(FGameAssets::AstraVajra ? FGameAssets::AstraVajra : FGameAssets::GunAK47);
        Mesh->SetRelativeScale3D(FGameAssets::AstraVajra ? FVector(0.016f) : FVector(0.85f));
        Ring->SetRelativeScale3D(FVector(1.1f, 1.1f, 0.04f));
        FLinearColor Col(0.2f, 0.85f, 1.0f);
        Tint(Ring, Col, 4.5f);
        if (Light) { Light->SetLightColor(Col); Light->SetIntensity(6000.f); }
    }
    else if (Type == EPowerUpType::WeaponTrishul)
    {
        Mesh->SetStaticMesh(FGameAssets::AstraTrident ? FGameAssets::AstraTrident : FGameAssets::GunShotgun);
        Mesh->SetRelativeScale3D(FGameAssets::AstraTrident ? FVector(0.014f) : FVector(0.85f));
        Ring->SetRelativeScale3D(FVector(1.1f, 1.1f, 0.04f));
        FLinearColor Col(1.0f, 0.45f, 0.05f);
        Tint(Ring, FLinearColor(1.f, 0.8f, 0.1f), 4.5f);
        if (Light) { Light->SetLightColor(Col); Light->SetIntensity(6500.f); }
    }
    else if (Type == EPowerUpType::WeaponChakra)
    {
        Mesh->SetStaticMesh(FGameAssets::AstraChakra ? FGameAssets::AstraChakra : FGameAssets::GunRocketLauncher);
        Mesh->SetRelativeScale3D(FGameAssets::AstraChakra ? FVector(0.012f) : FVector(0.85f));
        Ring->SetRelativeScale3D(FVector(1.15f, 1.15f, 0.05f));
        FLinearColor Col(1.0f, 0.88f, 0.2f);
        Tint(Ring, Col, 5.0f);
        if (Light) { Light->SetLightColor(Col); Light->SetIntensity(7000.f); }
    }
    else if (Type == EPowerUpType::SacredBell)
    {
        Mesh->SetStaticMesh(FGameAssets::Ganesha);
        Mesh->SetRelativeScale3D(FVector(0.24f));
        Ring->SetRelativeScale3D(FVector(1.0f, 1.0f, 0.05f));
        FLinearColor BellCol(1.f, 0.78f, 0.15f);
        Tint(Ring, FLinearColor(0.95f, 0.25f, 0.1f), 2.0f);
        if (Light) { Light->SetLightColor(BellCol); Light->SetIntensity(4500.f); }
    }
    else // Modak
    {
        Mesh->SetRelativeScale3D(FVector(0.55f, 0.55f, 0.7f));
        Ring->SetRelativeScale3D(FVector(0.8f, 0.8f, 0.03f));
        FLinearColor SweetCol(1.f, 0.88f, 0.35f);
        Tint(Mesh, SweetCol, 2.8f);
        Tint(Ring, SweetCol, 1.5f);
        if (Light) { Light->SetLightColor(SweetCol); Light->SetIntensity(2000.f); }
    }
}

void ALightPowerUp::Tick(float Delta)
{
    Super::Tick(Delta);
    if (bCollected) return;
    BobPhase += Delta * 4.5f;
    AddActorLocalRotation(FRotator(0, 140.f * Delta, 0));
    SetActorLocation(BasePos + FVector(0, 0, FMath::Sin(BobPhase) * 12.f));
}

ALightModak::ALightModak()
{
    PrimaryActorTick.bCanEverTick = true;
    Mesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("ModakMesh"));
    SetRootComponent(Mesh);
    Ring = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("ModakRing"));
    Ring->SetupAttachment(Mesh);
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Sphere(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Cylinder(TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
    Mesh->SetStaticMesh(Sphere.Object);
    Ring->SetStaticMesh(Cylinder.Object);
    Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Ring->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Mesh->SetCastShadow(false);
    Ring->SetCastShadow(false);
}

void ALightModak::Configure(FVector Position)
{
    BasePos = Position;
    SetActorLocation(Position);
    bCollected = false;
    SetActorHiddenInGame(false);
    Mesh->SetWorldScale3D(FVector(0.48f, 0.48f, 0.65f));
    Ring->SetRelativeScale3D(FVector(0.7f, 0.7f, 0.04f));
    FLinearColor GoldCol(1.f, 0.85f, 0.25f);
    Tint(Mesh, GoldCol, 2.5f);
    Tint(Ring, GoldCol, 1.8f);
}

void ALightModak::Tick(float Delta)
{
    Super::Tick(Delta);
    if (bCollected) return;
    BobPhase += Delta * 5.f;
    Mesh->AddLocalRotation(FRotator(0, 160.f * Delta, 0));
    SetActorLocation(BasePos + FVector(0, 0, FMath::Sin(BobPhase) * 10.f));
}

ALightProp::ALightProp()
{
    PrimaryActorTick.bCanEverTick = true;
    USceneComponent* Root = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
    SetRootComponent(Root);
    Mesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("PhysicsProp"));
    Mesh->SetupAttachment(Root);
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Cube(TEXT("/Engine/BasicShapes/Cube.Cube"));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Sphere(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Cylinder(TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
    Mesh->SetStaticMesh(Cube.Object);
    Mesh->SetMobility(EComponentMobility::Movable);
    ExtraA = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("ExtraA")); ExtraA->SetupAttachment(Root);
    ExtraB = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("ExtraB")); ExtraB->SetupAttachment(Root);
    WheelFL = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("WheelFL")); WheelFL->SetupAttachment(Root);
    WheelFR = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("WheelFR")); WheelFR->SetupAttachment(Root);
    WheelBL = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("WheelBL")); WheelBL->SetupAttachment(Root);
    WheelBR = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("WheelBR")); WheelBR->SetupAttachment(Root);
    ExtraA->SetStaticMesh(Sphere.Object); ExtraB->SetStaticMesh(Cube.Object);
    WheelFL->SetStaticMesh(Cylinder.Object); WheelFR->SetStaticMesh(Cylinder.Object);
    WheelBL->SetStaticMesh(Cylinder.Object); WheelBR->SetStaticMesh(Cylinder.Object);
    for (UStaticMeshComponent* Part : { ExtraA, ExtraB, WheelFL, WheelFR, WheelBL, WheelBR })
    {
        Part->SetCollisionEnabled(ECollisionEnabled::NoCollision);
        Part->SetVisibility(false);
    }
    EyeGlow = CreateDefaultSubobject<UPointLightComponent>(TEXT("DemonicEyeGlow"));
    EyeGlow->SetupAttachment(Root);
    EyeGlow->SetAttenuationRadius(450.f);
    EyeGlow->SetCastShadows(false);
    EyeGlow->SetVisibility(false);
}

void ALightProp::Configure(ETailKind Type, FVector Position, FVector Scale, bool Gate, bool Explosive, float Speed)
{
    FGameAssets::EnsureLoaded();
    Kind = Type; Home = Position; bGate = Gate; bExplosive = Explosive; MoveSpeed = Speed;
    SetActorLocation(Position);
    Mesh->SetCollisionProfileName(TEXT("BlockAll"));
    Mesh->SetSimulatePhysics(false);
    Mesh->SetRelativeRotation(FRotator(0.f, 180.f, 0.f)); // Face oncoming runner

    for (UStaticMeshComponent* Part : { ExtraA, ExtraB, WheelFL, WheelFR, WheelBL, WheelBR })
    {
        if (Part) Part->SetVisibility(false);
    }

    if (bGate || Type == ETailKind::DemonGate)
    {
        Mesh->SetStaticMesh(FGameAssets::AsuraGate ? FGameAssets::AsuraGate : CubeMesh());
        Mesh->SetVisibility(true);
        float MeshZ = Mesh->GetStaticMesh() ? Mesh->GetStaticMesh()->GetBoundingBox().GetSize().Z : 100.f;
        const float GateScale = (MeshZ > 1.f) ? (380.f / MeshZ) : 2.8f;
        SetActorScale3D(FVector(GateScale, GateScale * 1.5f, GateScale));
        Health = 6;
        Tint(Mesh, FLinearColor(0.20f, 0.05f, 0.22f), 1.2f, true);
        if (EyeGlow)
        {
            EyeGlow->SetLightColor(FLinearColor(1.f, 0.05f, 0.02f));
            EyeGlow->SetIntensity(14000.f);
            EyeGlow->SetAttenuationRadius(900.f);
            EyeGlow->SetRelativeLocation(FVector(25.f, 0, 180.f));
            EyeGlow->SetVisibility(true);
        }
    }
    else if (Type == ETailKind::Brute)
    {
        Mesh->SetStaticMesh(FGameAssets::AsuraBrute ? FGameAssets::AsuraBrute : CubeMesh());
        Mesh->SetVisibility(true);
        float MeshZ = Mesh->GetStaticMesh() ? Mesh->GetStaticMesh()->GetBoundingBox().GetSize().Z : 100.f;
        const float BruteScale = (MeshZ > 1.f) ? (230.f / MeshZ) : 2.2f;
        SetActorScale3D(FVector(BruteScale, BruteScale * 1.25f, BruteScale));
        Health = 3;
        Tint(Mesh, FLinearColor(0.35f, 0.05f, 0.08f), 1.6f, true);
        if (EyeGlow)
        {
            EyeGlow->SetLightColor(FLinearColor(1.f, 0.12f, 0.02f));
            EyeGlow->SetIntensity(9500.f);
            EyeGlow->SetAttenuationRadius(700.f);
            EyeGlow->SetRelativeLocation(FVector(0, 20.f, 150.f));
            EyeGlow->SetVisibility(true);
        }
    }
    else if (bExplosive || Type == ETailKind::Fiend)
    {
        Mesh->SetStaticMesh(FGameAssets::AsuraFiend ? FGameAssets::AsuraFiend : FGameAssets::AsuraMinion ? FGameAssets::AsuraMinion : CubeMesh());
        Mesh->SetVisibility(true);
        float MeshZ = Mesh->GetStaticMesh() ? Mesh->GetStaticMesh()->GetBoundingBox().GetSize().Z : 100.f;
        const float FiendScale = (MeshZ > 1.f) ? (150.f / MeshZ) : 1.5f;
        SetActorScale3D(FVector(FiendScale));
        Health = 1;
        Tint(Mesh, FLinearColor(1.0f, 0.40f, 0.05f), 3.8f, true);
        if (EyeGlow)
        {
            EyeGlow->SetLightColor(FLinearColor(1.f, 0.45f, 0.05f));
            EyeGlow->SetIntensity(11000.f);
            EyeGlow->SetAttenuationRadius(650.f);
            EyeGlow->SetRelativeLocation(FVector(0, 10.f, 120.f));
            EyeGlow->SetVisibility(true);
        }
    }
    else // Minion demon soldier
    {
        Mesh->SetStaticMesh(FGameAssets::AsuraMinion ? FGameAssets::AsuraMinion : CubeMesh());
        Mesh->SetVisibility(true);
        float MeshZ = Mesh->GetStaticMesh() ? Mesh->GetStaticMesh()->GetBoundingBox().GetSize().Z : 100.f;
        const float MinionScale = (MeshZ > 1.f) ? (140.f / MeshZ) : 1.4f;
        SetActorScale3D(FVector(MinionScale));
        Health = 1;
        Tint(Mesh, FLinearColor(0.28f, 0.06f, 0.06f), 1.0f, true);
        if (EyeGlow)
        {
            EyeGlow->SetLightColor(FLinearColor(1.f, 0.05f, 0.02f));
            EyeGlow->SetIntensity(6500.f);
            EyeGlow->SetAttenuationRadius(550.f);
            EyeGlow->SetRelativeLocation(FVector(0, 10.f, 120.f));
            EyeGlow->SetVisibility(true);
        }
    }
}

void ALightProp::Clear()
{
    if (bCleared) return;
    bCleared = true;
    SetActorTickEnabled(false);
    if (FloorStrip) FloorStrip->SetActorHiddenInGame(true);
    if (EyeGlow) EyeGlow->SetVisibility(false);
    SetActorHiddenInGame(true);
    SetActorEnableCollision(false);
    if (Mesh)
    {
        Mesh->SetSimulatePhysics(false);
        Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    }
}

void ALightProp::Explode()
{
    if (bCleared) return;
    Clear();
    auto* Game = Mode(this);
    if (Game)
    {
        Game->ObstaclesBlasted++;
        Game->Award(350, TEXT("HELLFIRE FIEND ERADICATED!"));
        Game->ChariotDistance = FMath::Min(70.f, Game->ChariotDistance + 2.5f);
        Game->PlayCue(TEXT("/Game/Audio/rocket_boom.rocket_boom"), 1.0f);
        Game->PlayCue(TEXT("/Game/Audio/asura_death.asura_death"), 1.0f);
        Game->PlayFX(Game->FXBoom, GetActorLocation() + FVector(0, 0, 40), 0.95f);
        Game->PlayFX(Game->FXBurst, GetActorLocation() + FVector(0, 0, 40), 0.8f);
        Game->Burst(25, GetActorLocation() + FVector(0, 0, 40), FLinearColor(0.85f, 0.15f, 0.85f), 550.f);
        Game->Juice(1.0f, 25, GetActorLocation(), FLinearColor(1.f, 0.45f, 0.1f));

        auto* Runner = Cast<ALightRunner>(UGameplayStatics::GetPlayerPawn(this, 0));
        for (ALightProp* Neighbor : Game->Props)
        {
            if (!IsValid(Neighbor) || Neighbor == this || Neighbor->bCleared) continue;
            if (FVector::DistSquared(GetActorLocation(), Neighbor->GetActorLocation()) < FMath::Square(620.f))
            {
                if (Neighbor->bExplosive)
                {
                    Neighbor->Explode();
                }
                else
                {
                    Neighbor->TakeMagicDamage(5, Runner);
                }
            }
        }
    }
}

void ALightProp::TakeMagicDamage(int32 Damage, ALightRunner* Shooter)
{
    if (bCleared) return;
    if (bExplosive)
    {
        Explode();
        return;
    }
    Health -= Damage;
    HitFlash = 0.20f;
    Tint(Mesh, FLinearColor(4.f, 0.4f, 0.4f), 10.f, true);
    auto* Game = Mode(this);
    if (Game)
    {
        Game->Burst(6, GetActorLocation() + FVector(0, 0, 50), FLinearColor(1.f, 0.3f, 0.3f), 240.f);
        Game->PlayCue(TEXT("/Game/Audio/asura_growl.asura_growl"), 0.85f);
    }
    if (Health <= 0)
    {
        Clear();
        if (Game)
        {
            Game->ObstaclesBlasted++;
            const TCHAR* KillMsg = (Kind == ETailKind::DemonGate || bGate) ? TEXT("MAHISHASURA GATE SMASHED!") :
                                   (Kind == ETailKind::Brute) ? TEXT("RAKSHASA BRUTE VANQUISHED!") :
                                                                TEXT("ASURA BANISHED!");
            Game->Award(100, KillMsg);
            Game->ChariotDistance = FMath::Min(70.f, Game->ChariotDistance + 1.2f);
            Game->PlayCue(TEXT("/Game/Audio/asura_death.asura_death"), 1.0f);
            Game->PlayCue(TEXT("/Game/Audio/bell_hit.bell_hit"), 0.75f);
            Game->PlayFX(Game->FXBoom, GetActorLocation() + FVector(0, 0, 40), 1.0f);
            Game->PlayFX(Game->FXBurst, GetActorLocation() + FVector(0, 0, 40), 0.8f);
            Game->Burst(20, GetActorLocation() + FVector(0, 0, 40), FLinearColor(0.95f, 0.2f, 0.2f), 450.f);
            Game->Juice(0.8f, 20, GetActorLocation(), FLinearColor(1.f, 0.75f, 0.2f));
        }
        if (Shooter)
        {
            Shooter->FOVKick = 4.f;
            Shooter->Trauma = FMath::Max(Shooter->Trauma, 0.35f);
        }
    }
    else
    {
        if (Game)
        {
            Game->PlayCue(TEXT("/Game/Audio/asura_growl.asura_growl"), 0.9f);
            Game->Burst(4, GetActorLocation() + FVector(0, 0, 50), FLinearColor(0.9f, 0.2f, 0.2f), 180.f);
        }
    }
}

void ALightProp::Tick(float Delta)
{
    Super::Tick(Delta);
    auto* Game = Mode(this);
    if (!Game || !Game->bRunning || Game->bPaused || bCleared) return;
    auto* NearbyRunner = Game->CachedRunner ? Game->CachedRunner.Get() : Cast<ALightRunner>(UGameplayStatics::GetPlayerPawn(this, 0));
    if (!NearbyRunner || FMath::Abs(GetActorLocation().X - NearbyRunner->GetActorLocation().X) > 4000.f) return;

    if (HitFlash > 0.f)
    {
        HitFlash -= Delta;
        if (HitFlash <= 0.f && Mesh)
        {
            if (bExplosive)
            {
                Tint(Mesh, FLinearColor(1.0f, 0.40f, 0.05f), 3.8f, true);
            }
            else
            {
                const FLinearColor RestColor = (bGate || Kind == ETailKind::DemonGate) ? FLinearColor(0.20f, 0.05f, 0.22f) :
                                               (Kind == ETailKind::Brute) ? FLinearColor(0.35f, 0.05f, 0.08f) :
                                                                            FLinearColor(0.28f, 0.06f, 0.06f);
                Tint(Mesh, RestColor, 1.2f, true);
            }
        }
    }

    if (MoveSpeed != 0.f && !Mesh->IsSimulatingPhysics())
    {
        AddActorWorldOffset(FVector(MoveSpeed * Delta, 0, 0), true);
    }

    if (!bCleared && (Kind == ETailKind::Minion || Kind == ETailKind::Brute))
    {
        const float Breath = FMath::Sin(Game->Elapsed * 4.5f + Home.X * 0.01f) * 2.5f;
        SetActorLocation(FVector(GetActorLocation().X, GetActorLocation().Y, Home.Z + Breath));
    }

    if (ExtraA && ExtraA->IsVisible())
    {
        const float Pulse = 1.05f + 0.22f * FMath::Sin(Game->Elapsed * 7.f);
        const float Base = Kind == ETailKind::Lever ? 1.8f : Kind == ETailKind::Anchor ? 0.9f : 1.15f;
        ExtraA->SetRelativeScale3D(FVector(Base * Pulse));
        if (IsEngineShape(ExtraA->GetStaticMesh()))
        {
            const FLinearColor Hold = Kind == ETailKind::Lever ? FLinearColor(1.f, 0.82f, 0.18f)
                : Kind == ETailKind::Light ? FLinearColor(1.f, 0.45f, 0.08f)
                : Kind == ETailKind::Cart ? FLinearColor(1.f, 0.7f, 0.2f)
                : FLinearColor(1.f, 0.86f, 0.28f);
            Tint(ExtraA, Hold, 2.4f + 1.4f * (0.5f + 0.5f * FMath::Sin(Game->Elapsed * 8.f)));
        }
    }
    if (!Mesh->IsSimulatingPhysics()) return;
    const FVector Position = GetActorLocation();
    if (Position.Z < -800 || FVector::DistSquared(Position, Home) > FMath::Square(9000.f))
    {
        SetActorLocation(Home, false, nullptr, ETeleportType::TeleportPhysics);
        Mesh->SetPhysicsLinearVelocity(FVector::ZeroVector);
        Mesh->SetPhysicsAngularVelocityInDegrees(FVector::ZeroVector);
    }
    auto* Runner = Game->CachedRunner ? Game->CachedRunner.Get() : Cast<ALightRunner>(UGameplayStatics::GetPlayerPawn(this, 0));
    if (Kind == ETailKind::Cart && Runner && FMath::Abs(Position.X - Runner->GetActorLocation().X) < 2800)
    {
        const bool Hard = Game->Surge > 0 || Game->Phase == EFeelPhase::Chaos || (Game->Flow >= 4 && Game->Bells == 3);
        const float Speed = Game->Bells < 3 ? 980.f : Hard ? 1450.f : 1150.f;
        const FVector Velocity = Mesh->GetPhysicsLinearVelocity();
        Mesh->AddForce(FVector(FMath::Clamp((Speed - Velocity.X) * 3, -2000.f, 2000.f), 0, 0), NAME_None, true);
        Spin += Velocity.X * Delta * 0.04f;
        const FRotator Roll(0, 0, FMath::RadiansToDegrees(Spin));
        WheelFL->SetRelativeRotation(FRotator(0, 0, 90) + Roll);
        WheelFR->SetRelativeRotation(FRotator(0, 0, 90) + Roll);
        WheelBL->SetRelativeRotation(FRotator(0, 0, 90) + Roll);
        WheelBR->SetRelativeRotation(FRotator(0, 0, 90) + Roll);
    }
    const FVector Velocity = Mesh->GetPhysicsLinearVelocity();
    if (Velocity.Size() > 2200) Mesh->SetPhysicsLinearVelocity(Velocity.GetClampedToMaxSize(2200));
    if (bGate && FMath::Abs(Position.Y) > 650 && !bCleared)
    {
        Clear();
        Game->TriggerChain(this);
        Game->Award(500, TEXT("ROAD CLEAR"));
    }
}

ALightCitizen::ALightCitizen()
{
    PrimaryActorTick.bCanEverTick = true;
    Body = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Body"));
    SetRootComponent(Body);
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Cube(TEXT("/Engine/BasicShapes/Cube.Cube"));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Sphere(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    Body->SetStaticMesh(Cube.Object);
    Body->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Head = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Head")); Head->SetupAttachment(Body);
    ArmL = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("ArmL")); ArmL->SetupAttachment(Body);
    ArmR = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("ArmR")); ArmR->SetupAttachment(Body);
    Skirt = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Skirt")); Skirt->SetupAttachment(Body);
    Head->SetStaticMesh(Sphere.Object);
    for (UStaticMeshComponent* Part : { Head, ArmL, ArmR, Skirt })
    {
        Part->SetCollisionEnabled(ECollisionEnabled::NoCollision);
        Part->SetVisibility(false);
    }
}

void ALightCitizen::Configure(FVector Position, FLinearColor Cloth)
{
    Home = Position;
    SetActorLocation(Position);
    UStaticMesh* DevoteeMesh = CitizenMesh();
    if (DevoteeMesh)
    {
        Body->SetStaticMesh(DevoteeMesh);
        SetActorScale3D(FVector(0.95f));
        Tint(Body, Cloth, 0.1f);
        Head->SetVisibility(false);
        ArmL->SetVisibility(false);
        ArmR->SetVisibility(false);
        Skirt->SetVisibility(false);
    }
    else
    {
        SetActorHiddenInGame(true);
        SetActorEnableCollision(false);
        return;
    }
}

void ALightCitizen::Tick(float Delta)
{
    Super::Tick(Delta);
    auto* Game = Mode(this);
    if (!Game || !Game->bRunning) return;
    auto* Runner = Game->CachedRunner ? Game->CachedRunner.Get() : Cast<ALightRunner>(UGameplayStatics::GetPlayerPawn(this, 0));
    if (!Runner) return;
    Bob += Delta * (Game->Surge > 0 ? 16.f : 6.f);
    FVector Location = Home;
    const FVector RunnerPos = Runner->GetActorLocation();
    const float Dist = FVector::Dist(RunnerPos, Home);
    if (Dist > 7000.f) { SetActorHiddenInGame(true); return; }
    SetActorHiddenInGame(false);

    // Natural roadside celebration behavior (no sliding across the road)
    const bool bNearRunner = Dist < 1400.f;
    const float Wave = (bNearRunner || Game->Surge > 0 || Game->Flow >= 6) ? 65.f : 15.f;
    ArmL->SetRelativeRotation(FRotator(FMath::Sin(Bob * 1.5f) * Wave, 0, -25));
    ArmR->SetRelativeRotation(FRotator(FMath::Sin(Bob * 1.5f + 1.2f) * Wave, 0, 25));
    Location.Z += FMath::Sin(Bob * 1.5f) * (bNearRunner ? 16.f : 6.f);
    SetActorLocation(Location);

    // Toss flower petals / gulal when runner passes by (frame-rate steady pacing)
    Dash += Delta;
    if (bNearRunner && Dash >= 0.16f)
    {
        Dash = 0.f;
        Game->Burst(1, Location + FVector(0, 0, 70), FLinearColor(0.98f, 0.45f, 0.15f), 120.f);
    }

    const FVector ToMouse = (RunnerPos - Location).GetSafeNormal2D();
    if (!ToMouse.IsNearlyZero()) SetActorRotation(ToMouse.Rotation());
}

ALightRath::ALightRath()
{
    PrimaryActorTick.bCanEverTick = true;
    Deck = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Deck"));
    SetRootComponent(Deck);
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Cube(TEXT("/Engine/BasicShapes/Cube.Cube"));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Sphere(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Cylinder(TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
    Deck->SetStaticMesh(Cube.Object);
    Deck->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Canopy = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Canopy")); Canopy->SetupAttachment(Deck);
    Idol = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Idol")); Idol->SetupAttachment(Deck);
    EarL = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("EarL")); EarL->SetupAttachment(Idol);
    EarR = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("EarR")); EarR->SetupAttachment(Idol);
    Trunk = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Trunk")); Trunk->SetupAttachment(Idol);
    WheelL = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("WheelL")); WheelL->SetupAttachment(Deck);
    WheelR = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("WheelR")); WheelR->SetupAttachment(Deck);
    LampL = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("LampL")); LampL->SetupAttachment(Deck);
    LampR = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("LampR")); LampR->SetupAttachment(Deck);
    Canopy->SetStaticMesh(Cube.Object); Idol->SetStaticMesh(Sphere.Object);
    EarL->SetStaticMesh(Sphere.Object); EarR->SetStaticMesh(Sphere.Object);
    Trunk->SetStaticMesh(Cylinder.Object);
    WheelL->SetStaticMesh(Cylinder.Object); WheelR->SetStaticMesh(Cylinder.Object);
    LampL->SetStaticMesh(Sphere.Object); LampR->SetStaticMesh(Sphere.Object);
    for (UStaticMeshComponent* Part : { Canopy, EarL, EarR, Trunk, WheelL, WheelR, LampL, LampR })
    {
        Part->SetCollisionEnabled(ECollisionEnabled::NoCollision);
        Part->SetVisibility(false);
    }

    AuraLight = CreateDefaultSubobject<UPointLightComponent>(TEXT("AuraLight"));
    AuraLight->SetupAttachment(Deck);
    AuraLight->SetRelativeLocation(FVector(80.f, 0.f, 150.f));
    AuraLight->SetLightColor(FLinearColor(1.f, 0.75f, 0.25f));
    AuraLight->SetIntensity(6000.f);
    AuraLight->SetAttenuationRadius(2400.f);
    AuraLight->SetCastShadows(false);
}

void ALightRath::InitRath()
{
    FGameAssets::EnsureLoaded();
    if (FGameAssets::Rath)
    {
        Deck->SetStaticMesh(FGameAssets::Rath);
        Deck->SetRelativeLocation(FVector::ZeroVector);
        Deck->SetRelativeScale3D(FVector(0.016f));
        SetActorScale3D(FVector(1.0f));
    }
    if (FGameAssets::Ganesha)
    {
        Idol->SetStaticMesh(FGameAssets::Ganesha);
        Idol->SetRelativeLocation(FVector(0.f, 0.f, 95.f));
        Idol->SetRelativeScale3D(FVector(0.9f));
        Idol->SetVisibility(true);
    }
    for (UStaticMeshComponent* Part : { Canopy, EarL, EarR, Trunk, WheelL, WheelR, LampL, LampR })
    {
        if (Part) Part->SetVisibility(false);
    }
}

void ALightRath::Drive(float X, float Panic, float Delta)
{
    SetActorLocation(FVector(X, 0, 130));
    Spin += Delta * (8.f + Panic * 10.f);
    if (Idol)
    {
        Idol->SetRelativeLocation(FVector(0.f, 0.f, 95.f + FMath::Sin(Spin) * 3.f));
    }

    if (AuraLight)
    {
        AuraLight->SetIntensity(FMath::Lerp(6000.f, 45000.f, Panic));
        AuraLight->SetAttenuationRadius(FMath::Lerp(2200.f, 4500.f, Panic));
        AuraLight->SetLightColor(FMath::Lerp(FLinearColor(1.f, 0.78f, 0.25f), FLinearColor(1.f, 0.25f, 0.08f), Panic));
    }

    // High panic: divine golden procession aura sparks
    if (Panic > 0.35f && FMath::FRand() < FMath::Min(1.f, Delta * 21.f))
    {
        if (auto* Game = Mode(this))
            Game->Burst(2, GetActorLocation() + FVector(FMath::FRandRange(-200.f, 200.f), FMath::FRandRange(-250.f, 250.f), 20.f), FLinearColor(1.f, 0.78f, 0.2f), 140.f);
    }
}

ALightRunner::ALightRunner()
{
    PrimaryActorTick.bCanEverTick = true;
    GetCapsuleComponent()->InitCapsuleSize(30, 45);
    auto* Movement = GetCharacterMovement();
    Movement->MaxWalkSpeed = 920; Movement->MaxAcceleration = 2800;
    Movement->JumpZVelocity = 780; Movement->AirControl = 0.9f;
    Movement->GravityScale = 2.4f; Movement->BrakingDecelerationWalking = 700;
    Movement->MaxStepHeight = 28;
    JumpMaxHoldTime = 0.22f;
    Boom = CreateDefaultSubobject<USpringArmComponent>(TEXT("ChaseBoom"));
    Boom->SetupAttachment(RootComponent);
    Boom->TargetArmLength = 500.f;
    Boom->SetRelativeRotation(FRotator(-22.f, 0.f, 0.f));
    Boom->bUsePawnControlRotation = false;
    Boom->bInheritPitch = false;
    Boom->bInheritYaw = false;
    Boom->bInheritRoll = false;
    Boom->bDoCollisionTest = true;
    Boom->ProbeSize = 12.f;
    Boom->bEnableCameraLag = true;
    Boom->CameraLagSpeed = 12.f;
    Boom->bEnableCameraRotationLag = true;
    Boom->CameraRotationLagSpeed = 14.f;
    Boom->TargetOffset = FVector(40.f, 0.f, 75.f);
    Camera = CreateDefaultSubobject<UCameraComponent>(TEXT("Camera"));
    Camera->SetupAttachment(Boom, USpringArmComponent::SocketName);
    Camera->SetRelativeLocation(FVector::ZeroVector);
    Camera->SetRelativeRotation(FRotator::ZeroRotator);
    Camera->bUsePawnControlRotation = false;
    Camera->bConstrainAspectRatio = false;
    Camera->FieldOfView = 74.f;
    Camera->PostProcessSettings.bOverride_BloomIntensity = true;
    Camera->PostProcessSettings.BloomIntensity = 0.22f;
    Camera->PostProcessSettings.bOverride_VignetteIntensity = true;
    Camera->PostProcessSettings.VignetteIntensity = 0.12f;
    Camera->PostProcessSettings.bOverride_MotionBlurAmount = true;
    Camera->PostProcessSettings.MotionBlurAmount = 0.f;
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Sphere(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Cube(TEXT("/Engine/BasicShapes/Cube.Cube"));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Cylinder(TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
    DropShadow = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("DropShadow"));
    DropShadow->SetupAttachment(RootComponent);
    DropShadow->SetStaticMesh(Cylinder.Object);
    DropShadow->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    DropShadow->SetCastShadow(false);
    Body = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Torso")); Body->SetupAttachment(RootComponent);
    Head = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Head")); Head->SetupAttachment(Body);
    EarL = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("EarL")); EarL->SetupAttachment(Head);
    EarR = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("EarR")); EarR->SetupAttachment(Head);
    Snout = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Snout")); Snout->SetupAttachment(Head);
    Scarf = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Scarf")); Scarf->SetupAttachment(Body);
    TailA = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("TailA")); TailA->SetupAttachment(Body);
    TailB = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("TailB")); TailB->SetupAttachment(TailA);
    TetherVisual = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("TailTether")); TetherVisual->SetupAttachment(RootComponent);
    HeroMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("HeroMesh")); HeroMesh->SetupAttachment(RootComponent);
    WeaponMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("WeaponMesh")); WeaponMesh->SetupAttachment(RootComponent);
    Body->SetStaticMesh(Sphere.Object); Head->SetStaticMesh(Sphere.Object);
    EarL->SetStaticMesh(Sphere.Object); EarR->SetStaticMesh(Sphere.Object);
    Snout->SetStaticMesh(Sphere.Object); Scarf->SetStaticMesh(Cube.Object);
    TailA->SetStaticMesh(Cylinder.Object); TailB->SetStaticMesh(Cylinder.Object);
    TetherVisual->SetStaticMesh(Cylinder.Object);
    HeroMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    HeroMesh->SetVisibility(true);
    WeaponMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    WeaponMesh->SetCastShadow(false);
    WeaponMesh->SetVisibility(true);
    for (UStaticMeshComponent* Part : { Body, Head, EarL, EarR, Snout, Scarf, TailA, TailB, TetherVisual, DropShadow, WeaponMesh })
        Part->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    for (UStaticMeshComponent* Part : { Body, Head, EarL, EarR, Snout, Scarf, TailA, TailB, TetherVisual })
        Part->SetVisibility(false);
}

void ALightRunner::SetupPlayerInputComponent(UInputComponent* Input)
{
    Super::SetupPlayerInputComponent(Input);
    Input->BindAxis("Steer", this, &ALightRunner::SetSteer);
    Input->BindAxis("Pace", this, &ALightRunner::SetPace);
    Input->BindAction("Leap", IE_Pressed, this, &ALightRunner::PressJump);
    Input->BindAction("Leap", IE_Released, this, &ALightRunner::ReleaseJump);
    Input->BindAction("BeginRun", IE_Pressed, this, &ALightRunner::BeginRun);
    Input->BindAction("Retry", IE_Pressed, this, &ALightRunner::Retry);
    auto& Pause = Input->BindAction("PauseRun", IE_Pressed, this, &ALightRunner::PauseRun);
    Pause.bExecuteWhenPaused = true;
    Input->BindKey(EKeys::LeftMouseButton, IE_Pressed, this, &ALightRunner::FireMagic);
    Input->BindKey(EKeys::RightMouseButton, IE_Pressed, this, &ALightRunner::PressAttack);
    Input->BindKey(EKeys::LeftShift, IE_Pressed, this, &ALightRunner::PressAttack);
    Input->BindKey(EKeys::RightShift, IE_Pressed, this, &ALightRunner::PressAttack);
    Input->BindKey(EKeys::One, IE_Pressed, this, &ALightRunner::SelectSlot1);
    Input->BindKey(EKeys::Two, IE_Pressed, this, &ALightRunner::SelectSlot2);
    Input->BindKey(EKeys::Three, IE_Pressed, this, &ALightRunner::SelectSlot3);
    Input->BindKey(EKeys::Four, IE_Pressed, this, &ALightRunner::SelectSlot4);
    Input->BindKey(EKeys::Q, IE_Pressed, this, &ALightRunner::PrevWeapon);
    Input->BindKey(EKeys::E, IE_Pressed, this, &ALightRunner::NextWeapon);
    Input->BindKey(EKeys::T, IE_Pressed, this, &ALightRunner::ToggleAutoFire);
    Input->BindKey(EKeys::F, IE_Pressed, this, &ALightRunner::PressAttack);
    auto& PKey = Input->BindKey(EKeys::P, IE_Pressed, this, &ALightRunner::PauseRun);
    PKey.bExecuteWhenPaused = true;
}

void ALightRunner::SelectWeapon(EWeaponType NewType)
{
    CurrentWeapon = NewType;
    WeaponLevel = WeaponLevels[FMath::Clamp(static_cast<int32>(CurrentWeapon), 0, 3)];
    FGameAssets::EnsureLoaded();
    UStaticMesh* AstraModel = nullptr;
    const TCHAR* WName = TEXT("INDRA'S VAJRA");
    FLinearColor WepGlowCol = FLinearColor(0.2f, 0.85f, 1.0f);
    const TCHAR* CuePath = TEXT("/Game/Audio/astra_vajra.astra_vajra");
    float DesiredScale = 52.f;

    if (CurrentWeapon == EWeaponType::Vajra)
    {
        AstraModel = FGameAssets::AstraVajra ? FGameAssets::AstraVajra : FGameAssets::GunAK47;
        WName = TEXT("INDRA'S VAJRA [PIERCING LIGHTNING]");
        WepGlowCol = FLinearColor(0.2f, 0.85f, 1.0f);
        CuePath = TEXT("/Game/Audio/astra_vajra.astra_vajra");
        DesiredScale = 54.f;
    }
    else if (CurrentWeapon == EWeaponType::Trishul)
    {
        AstraModel = FGameAssets::AstraTrident ? FGameAssets::AstraTrident : FGameAssets::GunShotgun;
        WName = TEXT("SHIVA'S AGNI TRISHUL [3-LANE HOLY FIRE]");
        WepGlowCol = FLinearColor(1.0f, 0.50f, 0.05f);
        CuePath = TEXT("/Game/Audio/astra_trishul.astra_trishul");
        DesiredScale = 58.f;
    }
    else if (CurrentWeapon == EWeaponType::Chakra)
    {
        AstraModel = FGameAssets::AstraChakra ? FGameAssets::AstraChakra : FGameAssets::GunRocketLauncher;
        WName = TEXT("SUDARSHANA CHAKRA [SOLAR DISC]");
        WepGlowCol = FLinearColor(1.0f, 0.88f, 0.15f);
        CuePath = TEXT("/Game/Audio/astra_chakra.astra_chakra");
        DesiredScale = 48.f;
    }
    else // Brahmastra
    {
        AstraModel = FGameAssets::AstraChakra ? FGameAssets::AstraChakra : FGameAssets::GunFlamethrower;
        WName = TEXT("BRAHMASTRA [CATACLYSM OBLITERATION]");
        WepGlowCol = FLinearColor(1.5f, 1.3f, 0.6f);
        CuePath = TEXT("/Game/Audio/jingle_surge.jingle_surge");
        DesiredScale = 68.f;
    }

    if (WeaponMesh)
    {
        WeaponMesh->SetStaticMesh(AstraModel);
        WeaponMesh->SetVisibility(AstraModel != nullptr);
        float MeshSize = (AstraModel) ? AstraModel->GetBoundingBox().GetSize().GetMax() : 100.f;
        float FinalWScale = (MeshSize > 1.f) ? (DesiredScale / MeshSize) : 0.85f;
        WeaponMesh->SetRelativeScale3D(FVector(FinalWScale));
        Tint(WeaponMesh, WepGlowCol, 3.5f, true);
    }

    if (auto* Game = Mode(this))
    {
        Game->Cue = FString::Printf(TEXT("INVOKED: %s (TIER %d)"), WName, WeaponLevel);
        Game->CueUntil = Game->Elapsed + 1.2f;
        Game->PlayCue(CuePath, 1.0f);
        FOVKick = 2.5f;
    }
}

void ALightRunner::NextWeapon()
{
    uint8 Next = (static_cast<uint8>(CurrentWeapon) + 1) % 4;
    SelectWeapon(static_cast<EWeaponType>(Next));
}

void ALightRunner::PrevWeapon()
{
    uint8 Prev = (static_cast<uint8>(CurrentWeapon) + 3) % 4;
    SelectWeapon(static_cast<EWeaponType>(Prev));
}

void ALightRunner::SelectSlot1() { SelectWeapon(EWeaponType::Vajra); }
void ALightRunner::SelectSlot2() { SelectWeapon(EWeaponType::Trishul); }
void ALightRunner::SelectSlot3() { SelectWeapon(EWeaponType::Chakra); }
void ALightRunner::SelectSlot4() { SelectWeapon(EWeaponType::Brahmastra); }

void ALightRunner::ToggleAutoFire()
{
    bAutoFire = !bAutoFire;
    if (auto* Game = Mode(this))
    {
        Game->Cue = bAutoFire ? TEXT("DIVINE AUTO-CAST: [ON]") : TEXT("MANUAL CAST: [OFF]");
        Game->CueUntil = Game->Elapsed + 0.8f;
    }
}

float ALightRunner::GetFireInterval() const
{
    static const float Intervals[4][4] = {
        {0.16f, 0.13f, 0.11f, 0.09f}, {0.32f, 0.28f, 0.24f, 0.20f},
        {0.22f, 0.18f, 0.15f, 0.12f}, {0.55f, 0.48f, 0.42f, 0.36f}
    };
    return Intervals[FMath::Clamp(static_cast<int32>(CurrentWeapon), 0, 3)][FMath::Clamp(WeaponLevel, 1, 4) - 1];
}

void ALightRunner::FireMagic()
{
    auto* Game = Mode(this);
    if (!Game || !Game->bRunning || Game->bPaused) return;
    UWorld* World = GetWorld();
    if (!World) return;

    if (FireCooldown > 0.f) return;
    FireCooldown = GetFireInterval();
    const FVector Muzzle = GetActorLocation() + FVector(65.f, 15.f, 12.f);

    auto SpawnOrGetBolt = [&]() -> ALightMagicBolt* {
        ALightMagicBolt* FiredBolt = nullptr;
        for (ALightMagicBolt* Bolt : Game->Bolts)
        {
            if (IsValid(Bolt) && !Bolt->bActive)
            {
                FiredBolt = Bolt;
                break;
            }
        }
        if (!FiredBolt && Game->Bolts.Num() < 60)
        {
            FiredBolt = World->SpawnActor<ALightMagicBolt>();
            Game->Bolts.Add(FiredBolt);
        }
        return FiredBolt;
    };

    if (CurrentWeapon == EWeaponType::Vajra)
    {
        // Indra's Vajra: High-velocity electric divine lightning bolt
        const float SpreadY = FMath::FRandRange(-1.2f, 1.2f);
        const float SpreadZ = FMath::FRandRange(-0.6f, 0.6f);
        const FVector Dir = FRotator(SpreadZ, SpreadY, 0.f).RotateVector(FVector(1.f, 0.f, 0.f));
        if (ALightMagicBolt* Bolt = SpawnOrGetBolt())
        {
            Bolt->Launch(Muzzle, Dir, EWeaponType::Vajra, WeaponLevel);
        }
        Game->PlayCue(TEXT("/Game/Audio/astra_vajra.astra_vajra"), 0.95f);
        Game->Burst(3, Muzzle, FLinearColor(0.2f, 0.85f, 1.0f), 130.f);
        FOVKick = 1.4f;
    }
    else if (CurrentWeapon == EWeaponType::Trishul)
    {
        // Shiva's Agni Trishul: 3-Prong Holy Fire Spread across lanes (-12, 0, +12 deg)
        const float Prongs[3] = { -12.f, 0.f, 12.f };
        for (float Ang : Prongs)
        {
            const float SpreadZ = FMath::FRandRange(-1.5f, 1.5f);
            const FVector Dir = FRotator(SpreadZ, Ang, 0.f).RotateVector(FVector(1.f, 0.f, 0.f));
            if (ALightMagicBolt* Bolt = SpawnOrGetBolt())
            {
                Bolt->Launch(Muzzle, Dir, EWeaponType::Trishul, WeaponLevel);
            }
        }
        Game->PlayCue(TEXT("/Game/Audio/astra_trishul.astra_trishul"), 1.0f);
        Game->Burst(6, Muzzle, FLinearColor(1.0f, 0.45f, 0.05f), 180.f);
        Game->PlayFX(Game->FXBurst, Muzzle, 0.5f);
        FOVKick = 2.5f;
    }
    else if (CurrentWeapon == EWeaponType::Chakra)
    {
        // Vishnu's Sudarshana Chakra: Spinning solar disc piercing lanes
        const float SpreadY = FMath::FRandRange(-2.0f, 2.0f);
        const FVector Dir = FRotator(0.f, SpreadY, 0.f).RotateVector(FVector(1.f, 0.f, 0.f));
        if (ALightMagicBolt* Bolt = SpawnOrGetBolt())
        {
            Bolt->Launch(Muzzle, Dir, EWeaponType::Chakra, WeaponLevel);
        }
        Game->PlayCue(TEXT("/Game/Audio/astra_chakra.astra_chakra"), 1.0f);
        Game->Burst(8, Muzzle, FLinearColor(1.0f, 0.88f, 0.2f), 220.f);
        Game->PlayFX(Game->FXBoom, Muzzle, 0.3f);
        FOVKick = 3.0f;
    }
    else // Brahmastra
    {
        // Brahmastra: Giant celestial disc with obliteration shockwave
        const FVector Dir = FVector(1.f, 0.f, 0.f);
        if (ALightMagicBolt* Bolt = SpawnOrGetBolt())
        {
            Bolt->Launch(Muzzle, Dir, EWeaponType::Brahmastra, WeaponLevel);
        }
        Game->PlayCue(TEXT("/Game/Audio/jingle_surge.jingle_surge"), 1.0f);
        Game->Burst(15, Muzzle, FLinearColor(1.0f, 0.95f, 0.4f), 300.f);
        Game->PlayFX(Game->FXTrail, Muzzle, 0.8f);
        FOVKick = 6.0f;
        Trauma = FMath::Max(Trauma, 0.5f);
    }
}

void ALightRunner::SetSteer(float Value) { Steering = FMath::Clamp(Value, -1.f, 1.f); }
void ALightRunner::SetPace(float Value) { Pace = FMath::Clamp(Value, -1.f, 1.f); }
void ALightRunner::BeginRun() { if (auto* Game = Mode(this)) Game->StartRun(); }
void ALightRunner::Retry() { UGameplayStatics::OpenLevel(this, FName("TailLab"), true, TEXT("retry")); }

void ALightRunner::PauseRun()
{
    if (auto* Game = Mode(this))
    {
        if (!Game->bRunning) return;
        CancelTail(); Steering = 0; Pace = 0; ReleaseJump();
        Game->bPaused = !Game->bPaused;
        UGameplayStatics::SetGamePaused(this, Game->bPaused);
        UGameplayStatics::SetGlobalTimeDilation(this, 1.f);
    }
}
void ALightRunner::PressJump()
{
    auto* Game = Mode(this);
    if (!Game || !Game->bRunning || Game->bPaused) return;
    bJumpHeld = true;
    auto* Movement = GetCharacterMovement();
    if (Movement && (Movement->IsMovingOnGround() || Coyote > 0.f))
    {
        LaunchCharacter(FVector(0, 0, Movement->JumpZVelocity), false, true);
        Coyote = 0.f; JumpBuffer = 0.f;
        JumpSquash = 0.24f;
        Game->PlayCue(TEXT("/Game/Audio/cloth.cloth"), 0.95f);
        Game->PlayFX(Game->FXTrail, GetActorLocation() - FVector(0, 0, 35.f), 0.25f);
        Game->Burst(6, GetActorLocation() - FVector(0, 0, 35.f), FLinearColor(0.9f, 0.8f, 0.65f), 140.f);
    }
    else
    {
        JumpBuffer = 0.18f;
    }
    if (Clutch > 0)
    {
        SetActorLocation(Recovery + FVector(0, 0, 60));
        GetCharacterMovement()->SetMovementMode(MOVE_Falling);
        const float SteerY = FMath::Clamp(-GetActorLocation().Y * 0.6f, -400.f, 400.f);
        LaunchCharacter(FVector(600, SteerY, 550), true, true);
        Clutch = 0; JumpBuffer = 0;
        Game->Saves++;
        Game->Award(250, TEXT("CLUTCH!"));
        Game->PlayCue(TEXT("/Game/Audio/bell_hit.bell_hit"), 0.9f);
        Game->PlayCue(TEXT("/Game/Audio/jingle_perfect.jingle_perfect"), 0.5f);
    }
}
void ALightRunner::ReleaseJump()
{
    bJumpHeld = false; StopJumping();
    if (GetCharacterMovement()->Velocity.Z > 0) GetCharacterMovement()->Velocity.Z *= 0.5f;
}
void ALightRunner::PressTail()
{
    FireMagic();
}
void ALightRunner::ReleaseTail()
{
    bTailHeld = false;
    if (!IsValid(Attached)) { Attached = nullptr; return; }
    auto* Game = Mode(this);
    if (Game && Game->bRunning && HoldTime > 0.12f)
    {
        if (Attached->Kind == ETailKind::Anchor || Attached->Kind == ETailKind::Cart)
        {
            const bool Clean = GetVelocity().X > 650 && GetVelocity().Z > -200;
            Momentum = FMath::Min(1600.f, Momentum + (Clean ? 150 : 50));
            FVector Launch = GetVelocity();
            // Launch forward with soaring arc instead of squashing Z
            Launch.X = FMath::Max(Launch.X * (Clean ? 1.25f : 1.1f), Clean ? 1150.f : 850.f);
            Launch.Z = FMath::Clamp(Launch.Z + (Clean ? 180.f : 80.f), 180.f, 480.f);
            LaunchCharacter(Launch, true, true);
            if (!Attached->bScored) Game->Award(Clean ? 200 : 80, Clean ? TEXT("PERFECT RELEASE!") : TEXT("RELEASE!"));
            Game->PlayCue(Clean ? TEXT("/Game/Audio/jingle_perfect.jingle_perfect") : TEXT("/Game/Audio/creak.creak"), Clean ? 0.7f : 0.45f);
            FOVKick = Clean ? 12.f : 6.f;
            Trauma = FMath::Max(Trauma, Clean ? 0.5f : 0.25f);
            Game->PlayFX(Game->FXTrail, GetActorLocation(), 0.35f);
            Game->Juice(0.45f, Clean ? 12 : 6, GetActorLocation(), FLinearColor(1.f, 0.82f, 0.25f));
        }
        else if (Attached->Kind == ETailKind::Light)
        {
            // MEGA SLINGSHOT: Hurl obstacle forward at high speed to demolish roadblocks ahead!
            FVector ForwardDir = (GetVelocity().GetSafeNormal2D() + FVector(1.f, 0, 0)).GetSafeNormal();
            FVector SlingImpulse = ForwardDir * 3600.f + FVector(0, 0, 420.f);
            Attached->Mesh->AddImpulse(SlingImpulse, NAME_None, true);
            if (!Attached->bScored) Game->Award(150, TEXT("SLINGSHOT!"));
            FOVKick = 8.f;
            Trauma = FMath::Max(Trauma, 0.45f);
            Game->PlayCue(TEXT("/Game/Audio/whip.whip"), 1.0f);
            Game->PlayCue(TEXT("/Game/Audio/wood_hit.wood_hit"), 0.85f);
            Game->PlayFX(Game->FXBoom, Attached->GetActorLocation(), 0.35f);
            Game->PlayFX(Game->FXTrail, Attached->GetActorLocation(), 0.4f);
            Game->Juice(0.6f, 14, Attached->GetActorLocation(), FLinearColor(1.f, 0.85f, 0.2f));
        }
        Attached->bScored = true;
    }
    CancelTail();
}

void ALightRunner::CancelTail()
{
    bTailHeld = false; Attached = nullptr;
    if (TetherVisual) TetherVisual->SetVisibility(false);
}

void ALightRunner::PressAttack()
{
    auto* Game = Mode(this);
    if (!Game || !Game->bRunning || Game->bPaused || AttackTime > 0.f) return;
    AttackTime = 0.32f;
    FOVKick = 8.f;
    Trauma = FMath::Max(Trauma, 0.55f);
    Game->PlayCue(TEXT("/Game/Audio/whip.whip"), 1.0f);
    Game->PlayFX(Game->FXTrail, GetActorLocation() + FVector(60.f, 0, 20.f), 0.45f);
    Game->Burst(8, GetActorLocation() + FVector(50.f, 0, 25.f), FLinearColor(1.f, 0.85f, 0.25f), 300.f);

    bool bHit = false;
    for (ALightProp* Prop : Game->Props)
    {
        if (!IsValid(Prop) || Prop->bCleared) continue;
        const float DistSq = FVector::DistSquared(Prop->GetActorLocation(), GetActorLocation());
        if (DistSq < FMath::Square(440.f))
        {
            if (Prop->Kind == ETailKind::Lever && !Prop->bCleared)
            {
                // SMASH GATE OPEN!
                Prop->Clear();
                Game->TriggerChain(Prop);
                Game->Award(500, TEXT("GATE SMASHED!"));
                Game->PlayCue(TEXT("/Game/Audio/latch.latch"), 1.0f);
                Game->PlayCue(TEXT("/Game/Audio/bell_hit.bell_hit"), 0.9f);
                Game->PlayFX(Game->FXBurst, Prop->Home + FVector(0, 0, 40), 0.5f);
                Game->PlayFX(Game->FXBoom, Prop->Home + FVector(0, 0, 30), 0.4f);
                UGameplayStatics::SetGlobalTimeDilation(this, 0.05f);
                GetWorldTimerManager().SetTimer(Game->SlowMoTimer, Game, &ALightGameMode::RestoreTime, 0.004f, false);
                Trauma = 1.0f;
                FOVKick = 12.f;
                bHit = true;
            }
            else if (Prop->Kind == ETailKind::Minion || Prop->Kind == ETailKind::Brute || Prop->Kind == ETailKind::Fiend || Prop->Kind == ETailKind::DemonGate)
            {
                // DIRECT MELEE STRIKE ON DEMON!
                Prop->TakeMagicDamage(4, this);
                Game->PlayCue(TEXT("/Game/Audio/wood_hit.wood_hit"), 0.9f);
                Game->PlayCue(TEXT("/Game/Audio/whip.whip"), 1.0f);
                Game->Burst(10, Prop->GetActorLocation(), FLinearColor(1.f, 0.6f, 0.1f), 350.f);
                bHit = true;
            }
            else if (Prop->Mesh)
            {
                if (!Prop->Mesh->IsSimulatingPhysics())
                {
                    Prop->Mesh->SetSimulatePhysics(true);
                    Prop->Mesh->SetCollisionProfileName(TEXT("PhysicsActor"));
                }
                // VIOLENTLY SMACK OBSTACLE SIDEWAYS OFF THE ROAD!
                const float SideSign = (Prop->GetActorLocation().Y - GetActorLocation().Y >= 0.f) ? 1.f : -1.f;
                FVector BlastImpulse = FVector(600.f, SideSign * 2400.f, 480.f);
                Prop->Mesh->AddImpulse(BlastImpulse, NAME_None, true);
                Game->Award(120, TEXT("TAIL SMASH!"));
                Game->PlayCue(TEXT("/Game/Audio/wood_hit.wood_hit"), 0.9f);
                Game->PlayFX(Game->FXBoom, Prop->GetActorLocation(), 0.3f);
                Game->Juice(0.5f, 10, Prop->GetActorLocation(), FLinearColor(1.f, 0.5f, 0.1f));
                bHit = true;
            }
        }
    }
    if (bHit)
    {
        if (UGameplayStatics::GetGlobalTimeDilation(this) > 0.5f)
        {
            UGameplayStatics::SetGlobalTimeDilation(this, 0.03f);
            GetWorldTimerManager().SetTimer(Game->SlowMoTimer, Game, &ALightGameMode::RestoreTime, 0.0012f, false);
        }
        Game->Shake = FMath::Max(Game->Shake, 1.0f);
    }
}

void ALightRunner::Tick(float Delta)
{
    Super::Tick(Delta);
    auto* Game = Mode(this);
    if (!Game) return;
    Wag += Delta * (Game->bRunning ? 8.f + GetVelocity().Size2D() * 0.02f : 5.f);
    FGameAssets::EnsureLoaded();
    if (HeroMesh && HeroMesh->GetStaticMesh() != FGameAssets::Mooshak && FGameAssets::Mooshak)
    {
        HeroMesh->SetStaticMesh(FGameAssets::Mooshak);
        HeroMesh->SetVisibility(true);
        HeroMesh->SetRelativeLocation(FVector(0.f, 0.f, -44.f));
        HeroMesh->SetRelativeRotation(FRotator(0.f, -90.f, 0.f));
        HeroMesh->SetRelativeScale3D(FVector(0.18f));
    }
    for (UStaticMeshComponent* Part : { Body, Head, EarL, EarR, Snout, Scarf, TailA, TailB, TetherVisual })
    {
        if (Part && Part->IsVisible()) Part->SetVisibility(false);
    }
    if (WeaponMesh && !WeaponMesh->GetStaticMesh())
    {
        SelectWeapon(CurrentWeapon);
    }

    if (!Game->bRunning)
    {
        return;
    }
    auto* Movement = GetCharacterMovement();
    const FVector Position = GetActorLocation();
    LastVelocity = GetVelocity();
    const bool Grounded = Movement->IsMovingOnGround();
    bAirborne = !Grounded;
    if (Grounded)
    {
        Coyote = 0.12f;
        Recovery = FVector(FMath::Clamp(Position.X, 100.f, Game->FinishX), FMath::Clamp(Position.Y, -700.f, 700.f), 90);
    }
    else Coyote = FMath::Max(0.f, Coyote - Delta);
    JumpBuffer = FMath::Max(0.f, JumpBuffer - Delta);
    if (JumpBuffer > 0 && Coyote > 0)
    {
        LaunchCharacter(FVector(0, 0, Movement->JumpZVelocity), false, true);
        Coyote = 0; JumpBuffer = 0;
    }
    if (Position.Z < -350.f)
    {
        CancelTail();
        SetActorLocation(Recovery + FVector(0, 0, 80));
        Movement->Velocity = FVector(700.f, 0, 0);
        Game->Stumble();
        Momentum = 750;
    }
    bWasGrounded = Grounded;
    Momentum = FMath::Min(1600.f, Momentum + Delta * (Grounded ? 5 : 1));
    AttackTime = FMath::Max(0.f, AttackTime - Delta);
    float EffectiveSteer = Steering;
    float EffectivePace = Pace;
    FireCooldown = FMath::Max(0.f, FireCooldown - Delta);
    bool bFirePressed = false;
    if (APlayerController* PC = Cast<APlayerController>(GetController()))
    {
        bFirePressed = PC->IsInputKeyDown(EKeys::LeftMouseButton);
    }
    if (bAutoFire || bFirePressed) FireMagic();

    Movement->MaxWalkSpeed = 920.f + (Game->Surge > 0 ? 220.f : 0.f) + Momentum * 0.08f;
    Movement->MaxAcceleration = 2800.f;
    Movement->BrakingDecelerationWalking = 900.f;
    Movement->GroundFriction = Position.X >= 42000 && Position.X < 78000 ? 2.8f : 4.8f;
    AddMovementInput(FVector(1, 0, 0), 1.f + EffectivePace * 0.28f);
    AddMovementInput(FVector(0, 1, 0), EffectiveSteer);
    FacingYaw = FMath::FInterpTo(FacingYaw, EffectiveSteer * 18.f, Delta, 8.f);

    const float Gap = Game->GapMeters(this);
    const float Panic = Gap < 10.f ? 1.f : Gap < 20.f ? 0.65f : Gap < 30.f ? 0.35f : 0.f;
    Game->Shake = FMath::Max(0.f, Game->Shake - Delta * 6.f);
    FOVKick = FMath::FInterpTo(FOVKick, 0.f, Delta, 10.f);
    Trauma = FMath::Max(0.f, Trauma - Delta * 4.5f);
    Game->VignetteKick = FMath::Max(0.f, Game->VignetteKick - Delta * 4.f);
    const float TraumaSq = Trauma * Trauma;
    const float ShakeAmt = FMath::Min(1.f, Game->Shake + TraumaSq + Panic * 0.18f);
    const float ShakeRoll = FMath::Sin(Game->Elapsed * 47.f) * ShakeAmt * 1.1f;
    const float ShakePitch = FMath::Cos(Game->Elapsed * 31.f) * ShakeAmt * 0.45f;
    Camera->SetRelativeLocation(FVector::ZeroVector);
    Camera->SetRelativeRotation(FRotator::ZeroRotator);
    const float SpeedRatio = FMath::Clamp(GetVelocity().Size() / 1600.f, 0.f, 1.f);
    const float DynPitch = FMath::Lerp(-20.f, -25.f, SpeedRatio) + ShakePitch;
    const float PeekYaw = FMath::FInterpTo(Boom->GetRelativeRotation().Yaw, Game->IntroLeft > 0.f ? -28.f : Panic * -16.f, Delta, Game->IntroLeft > 0.f ? 2.2f : 3.5f);
    Boom->SetRelativeRotation(FRotator(DynPitch, PeekYaw, ShakeRoll));
    Boom->TargetOffset = FVector(40.f, 0.f, 75.f);
    Boom->TargetArmLength = FMath::FInterpTo(Boom->TargetArmLength, 500.f + Panic * 60.f, Delta, 5.f);
    const float TargetFOV = FMath::Lerp(74.f, 82.f, SpeedRatio) + Panic * 4.f + FOVKick;
    Camera->SetFieldOfView(FMath::FInterpTo(Camera->FieldOfView, TargetFOV, Delta, FOVKick != 0.f ? 16.f : 5.f));
    Camera->PostProcessSettings.bOverride_SceneFringeIntensity = true;
    Camera->PostProcessSettings.SceneFringeIntensity = 0.f;
    Camera->PostProcessSettings.VignetteIntensity = 0.12f + Game->VignetteKick * 0.45f + Panic * 0.22f;
    Game->CameraPunch = FMath::Max(0.f, Game->CameraPunch - Delta * 6.f);

    if (DropShadow)
    {
        FHitResult GroundHit;
        FCollisionQueryParams TraceParams;
        TraceParams.AddIgnoredActor(this);
        const FVector TraceStart = Position + FVector(0, 0, 20.f);
        const FVector TraceEnd = Position - FVector(0, 0, 1500.f);
        if (GetWorld()->LineTraceSingleByChannel(GroundHit, TraceStart, TraceEnd, ECC_WorldStatic, TraceParams))
        {
            DropShadow->SetVisibility(true);
            DropShadow->SetWorldLocation(GroundHit.ImpactPoint + FVector(0, 0, 1.5f));
            DropShadow->SetWorldRotation(FRotationMatrix::MakeFromZ(GroundHit.ImpactNormal).Rotator());
            const float H = FMath::Max(0.f, Position.Z - GroundHit.ImpactPoint.Z);
            const float ShadowScale = FMath::Lerp(0.85f, 0.35f, FMath::Clamp(H / 450.f, 0.f, 1.f));
            DropShadow->SetWorldScale3D(FVector(ShadowScale, ShadowScale, 0.015f));
            Tint(DropShadow, FLinearColor(0.01f, 0.01f, 0.02f), 0.f);
        }
        else
        {
            DropShadow->SetVisibility(false);
        }
    }

    for (ALightPowerUp* Power : Game->PowerUps)
    {
        if (!IsValid(Power) || Power->bCollected) continue;
        if (FVector::DistSquared(Position, Power->GetActorLocation()) < FMath::Square(140.f))
        {
            Power->bCollected = true;
            Power->SetActorHiddenInGame(true);
            Power->SetActorTickEnabled(false);
            if (Power->Light) Power->Light->SetVisibility(false);
            if (Power->Type == EPowerUpType::WeaponVajra)
            {
                WeaponLevels[0] = FMath::Min(4, WeaponLevels[0] + 1);
                SelectWeapon(EWeaponType::Vajra);
                Game->Award(500, FString::Printf(TEXT("INDRA'S VAJRA AWAKENED! TIER %d"), WeaponLevel));
                Game->PlayCue(TEXT("/Game/Audio/jingle_surge.jingle_surge"), 1.0f);
                Game->PlayCue(TEXT("/Game/Audio/astra_vajra.astra_vajra"), 1.0f);
                Game->PlayFX(Game->FXFountain, GetActorLocation() + FVector(0, 0, 50), 0.6f);
                Game->Burst(20, GetActorLocation(), FLinearColor(0.2f, 0.85f, 1.0f), 450.f);
                FOVKick = 6.f;
            }
            else if (Power->Type == EPowerUpType::WeaponTrishul)
            {
                WeaponLevels[1] = FMath::Min(4, WeaponLevels[1] + 1);
                SelectWeapon(EWeaponType::Trishul);
                Game->Award(500, FString::Printf(TEXT("SHIVA'S AGNI TRISHUL AWAKENED! TIER %d"), WeaponLevel));
                Game->PlayCue(TEXT("/Game/Audio/jingle_surge.jingle_surge"), 1.0f);
                Game->PlayCue(TEXT("/Game/Audio/astra_trishul.astra_trishul"), 1.0f);
                Game->PlayFX(Game->FXFountain, GetActorLocation() + FVector(0, 0, 50), 0.6f);
                Game->Burst(20, GetActorLocation(), FLinearColor(1.0f, 0.45f, 0.05f), 450.f);
                FOVKick = 6.f;
            }
            else if (Power->Type == EPowerUpType::WeaponChakra)
            {
                WeaponLevels[2] = FMath::Min(4, WeaponLevels[2] + 1);
                SelectWeapon(EWeaponType::Chakra);
                Game->Award(500, FString::Printf(TEXT("SUDARSHANA CHAKRA AWAKENED! TIER %d"), WeaponLevel));
                Game->PlayCue(TEXT("/Game/Audio/jingle_surge.jingle_surge"), 1.0f);
                Game->PlayCue(TEXT("/Game/Audio/astra_chakra.astra_chakra"), 1.0f);
                Game->PlayFX(Game->FXFountain, GetActorLocation() + FVector(0, 0, 50), 0.6f);
                Game->Burst(20, GetActorLocation(), FLinearColor(1.0f, 0.88f, 0.2f), 450.f);
                FOVKick = 6.f;
            }
            else if (Power->Type == EPowerUpType::SacredBell)
            {
                Game->ChariotDistance = FMath::Min(70.f, Game->ChariotDistance + 15.f);
                Game->Bells = FMath::Min(3, Game->Bells + 1);
                Game->Award(300, TEXT("SACRED BELL RESTORED! CHARIOT REPELLED +15m!"));
                Game->PlayCue(TEXT("/Game/Audio/bell_hit.bell_hit"), 1.0f);
                Game->PlayFX(Game->FXBurst, GetActorLocation(), 0.5f);
                Game->Burst(15, GetActorLocation(), FLinearColor(1.f, 0.78f, 0.15f), 350.f);
            }
            else
            {
                Game->Award(100, TEXT("PRASAD MODAK +100"));
                Game->PlayCue(TEXT("/Game/Audio/jingle_perfect.jingle_perfect"), 0.7f);
                Game->Burst(8, GetActorLocation(), FLinearColor(1.f, 0.85f, 0.2f), 220.f);
            }
        }
    }

    for (ALightProp* Prop : Game->Props)
    {
        if (!IsValid(Prop) || Prop->bCleared || Prop->bMissed) continue;
        if (Position.X > Prop->GetActorLocation().X + 160.f)
        {
            Prop->bMissed = true;
            Game->MissedObstacles++;
            Game->ChariotDistance = FMath::Max(0.f, Game->ChariotDistance - 10.f);
            Game->Cue = TEXT("MISSED OBSTACLE! CHARIOT CLOSES IN (-10m)!");
            Game->CueUntil = Game->Elapsed + 1.2f;
            Game->Shake = FMath::Max(Game->Shake, 0.85f);
            Game->VignetteKick = 0.9f;
            Game->PlayCue(TEXT("/Game/Audio/wood_heavy.wood_heavy"), 0.9f);
            Game->PlayCue(TEXT("/Game/Audio/alarm_pulse.alarm_pulse"), 0.8f);
        }
    }
    CollisionCooldown -= Delta;
    if (Grounded && !Attached && GetVelocity().X < 40 && Game->Elapsed > 6 && CollisionCooldown <= 0)
    {
        Game->Stumble(); Momentum = FMath::Max(700.f, Momentum * 0.8f); CollisionCooldown = 2.5f;
        Game->Shake = 0.25f;
    }

    FGameAssets::EnsureLoaded();
    UStaticMesh* HeroModel = FGameAssets::Mooshak;
    const bool bIsMoving = GetVelocity().Size2D() > 40.f;
    const float GallopBob = (bIsMoving && Grounded) ? FMath::Abs(FMath::Sin(Wag * 1.8f)) * 4.f : 0.f;
    const float GallopPitch = (bIsMoving && Grounded) ? FMath::Sin(Wag * 1.8f) * 2.5f : (Grounded ? 0.f : -5.f);
    const float Lean = FMath::Clamp(EffectiveSteer * 10.f, -12.f, 12.f);

    if (HeroMesh)
    {
        if (HeroMesh->GetStaticMesh() != HeroModel && HeroModel)
        {
            HeroMesh->SetStaticMesh(HeroModel);
            HeroMesh->SetVisibility(true);
            HeroMesh->SetRelativeLocation(FVector(0.f, 0.f, -44.f));
            HeroMesh->SetRelativeRotation(FRotator(0.f, -90.f, 0.f));
            HeroMesh->SetRelativeScale3D(FVector(0.18f));
        }
        for (UStaticMeshComponent* Part : { Body, Head, EarL, EarR, Snout, Scarf, TailA, TailB })
        {
            if (Part && Part->IsVisible()) Part->SetVisibility(false);
        }
        JumpSquash = FMath::FInterpTo(JumpSquash, 0.f, Delta, 8.f);
        const float SquashXY = 0.18f * (1.f + JumpSquash * -0.3f);
        const float SquashZ = 0.18f * (1.f + JumpSquash);
        HeroMesh->SetRelativeLocation(FVector(0.f, 0.f, -44.f + GallopBob));
        HeroMesh->SetRelativeScale3D(FVector(SquashXY, SquashXY, SquashZ));
        HeroMesh->SetRelativeRotation(FRotator(GallopPitch, -90.f + FacingYaw, Lean));
        HeroMesh->SetOverlayMaterial(nullptr);
    }

    if (WeaponMesh)
    {
        if (!WeaponMesh->GetStaticMesh())
        {
            SelectWeapon(CurrentWeapon);
        }
        const float RecoilX = (FireCooldown > 0.f) ? -6.f : 0.f;
        const float FloatBob = FMath::Sin(Game->Elapsed * 3.5f) * 3.f;
        WeaponMesh->SetRelativeLocation(FVector(20.f + RecoilX, 24.f, 18.f + GallopBob + FloatBob));
        WeaponMesh->SetRelativeRotation(FRotator(GallopPitch + 10.f, FacingYaw + 20.f, Lean));
        WeaponMesh->SetVisibility(true);
    }
}

void ALightRunner::Landed(const FHitResult& Hit)
{
    const FVector Impact = LastVelocity;
    Super::Landed(Hit);
    auto* Game = Mode(this);
    if (!Game || !Game->bRunning) return;
    Game->PlayCue(TEXT("/Game/Audio/wood_hit.wood_hit"), 0.65f);
    Game->PlayFX(Game->FXTrail, GetActorLocation() - FVector(0, 0, 35.f), 0.22f);
    Game->Burst(5, GetActorLocation() - FVector(0, 0, 38.f), FLinearColor(0.85f, 0.75f, 0.6f), 100.f);
    JumpSquash = -0.16f;
    FOVKick = -2.5f;
    if (Impact.X > 850 && Impact.Z > -1000 && Hit.ImpactNormal.Z > 0.9f && FMath::Abs(Steering) < 0.75f)
    {
        Momentum = FMath::Min(1600.f, Momentum + 90); Game->Perfects++;
        Game->Award(150, TEXT("PERFECT LANDING!"));
        Game->PlayCue(TEXT("/Game/Audio/wood_hit.wood_hit"), 0.65f);
        Game->PlayCue(TEXT("/Game/Audio/jingle_perfect.jingle_perfect"), 0.55f);
        Game->PlayFX(Game->FXTrail, GetActorLocation() + FVector(-80, 0, 20), 0.18f);
        Game->MarkPath(GetActorLocation());
        Trauma = FMath::Max(Trauma, 0.22f);
    }
    else if (Impact.Z < -1200)
    {
        Momentum *= 0.8f; Game->Stumble(); Game->Shake = 0.9f;
    }
    if (GetActorLocation().X >= 42000.f && GetActorLocation().X < 78000.f)
    {
        for (ALightProp* Prop : Game->Props)
        {
            if (!IsValid(Prop) || Prop->Kind != ETailKind::Light) continue;
            if (FVector::DistSquared(Prop->GetActorLocation(), GetActorLocation()) < FMath::Square(220.f))
            {
                LaunchCharacter(FVector(GetVelocity().X, GetVelocity().Y, 720), true, true);
                Game->Award(120, TEXT("UMBRELLA BOUNCE"));
                Game->Juice(0.8f, 12, Prop->GetActorLocation(), FLinearColor(0.6f, 0.8f, 1.f));
                break;
            }
        }
    }
}

ALightGameMode::ALightGameMode()
{
    PrimaryActorTick.bCanEverTick = true;
    DefaultPawnClass = ALightRunner::StaticClass(); HUDClass = ALightHUD::StaticClass();
    Music = CreateDefaultSubobject<UAudioComponent>(TEXT("MusicBed"));
    CrowdBed = CreateDefaultSubobject<UAudioComponent>(TEXT("CrowdBed"));
    Music->bAutoActivate = false;
    CrowdBed->bAutoActivate = false;
    static ConstructorHelpers::FObjectFinder<UNiagaraSystem> Burst(TEXT("/Niagara/DefaultAssets/Templates/Systems/RadialBurst.RadialBurst"));
    static ConstructorHelpers::FObjectFinder<UNiagaraSystem> Boom(TEXT("/Niagara/DefaultAssets/Templates/Systems/SimpleExplosion.SimpleExplosion"));
    static ConstructorHelpers::FObjectFinder<UNiagaraSystem> Fountain(TEXT("/Niagara/DefaultAssets/Templates/Systems/FountainLightweight.FountainLightweight"));
    static ConstructorHelpers::FObjectFinder<UNiagaraSystem> Trail(TEXT("/Niagara/DefaultAssets/Templates/Systems/DirectionalBurst.DirectionalBurst"));
    if (Burst.Succeeded()) FXBurst = Burst.Object;
    if (Boom.Succeeded()) FXBoom = Boom.Object;
    if (Fountain.Succeeded()) FXFountain = Fountain.Object;
    if (Trail.Succeeded()) FXTrail = Trail.Object;
}

void ALightGameMode::PlayCue(const TCHAR* SoftPath, float Vol)
{
    // Pre-cache sounds to avoid per-play LoadObject frame hitches
    static TMap<FString, USoundBase*> SoundCache;
    static bool bCacheBuilt = false;
    if (!bCacheBuilt)
    {
        bCacheBuilt = true;
        static const TCHAR* AllPaths[] = {
            TEXT("/Game/Audio/bell_hit.bell_hit"),
            TEXT("/Game/Audio/jingle_perfect.jingle_perfect"),
            TEXT("/Game/Audio/jingle_surge.jingle_surge"),
            TEXT("/Game/Audio/cloth.cloth"),
            TEXT("/Game/Audio/creak.creak"),
            TEXT("/Game/Audio/latch.latch"),
            TEXT("/Game/Audio/wood_hit.wood_hit"),
            TEXT("/Game/Audio/wood_heavy.wood_heavy"),
            TEXT("/Game/Audio/india_rhythm.india_rhythm"),
            TEXT("/Game/Audio/tabla_tune.tabla_tune"),
            TEXT("/Game/Audio/rocket_boom.rocket_boom"),
            TEXT("/Game/Audio/rath_grind.rath_grind"),
            TEXT("/Game/Audio/alarm_pulse.alarm_pulse"),
            TEXT("/Game/Audio/asura_growl.asura_growl"),
            TEXT("/Game/Audio/asura_death.asura_death"),
            TEXT("/Game/Audio/astra_vajra.astra_vajra"),
            TEXT("/Game/Audio/astra_trishul.astra_trishul"),
            TEXT("/Game/Audio/astra_chakra.astra_chakra"),
        };
        for (const TCHAR* Path : AllPaths)
        {
            if (USoundBase* S = LoadObject<USoundBase>(nullptr, Path))
            {
                S->AddToRoot();
                SoundCache.Add(Path, S);
            }
        }
    }
    USoundBase* Sound = nullptr;
    if (USoundBase** Found = SoundCache.Find(SoftPath))
    {
        Sound = *Found;
    }
    else
    {
        Sound = LoadObject<USoundBase>(nullptr, SoftPath); // fallback for unknown paths
        if (Sound)
        {
            Sound->AddToRoot();
            SoundCache.Add(SoftPath, Sound);
        }
    }
    if (IsValid(Sound))
    {
        static TMap<FString, double> LastPlayed;
        const double Now = FPlatformTime::Seconds();
        const double* Previous = LastPlayed.Find(SoftPath);
        if (Previous && Now - *Previous < 0.06) return;
        LastPlayed.Add(SoftPath, Now);
        UGameplayStatics::PlaySound2D(this, Sound, Vol);
    }
}

void ALightGameMode::PlayFX(UNiagaraSystem* System, FVector At, float Scale)
{
    if (!System || !GetWorld()) return;
    UNiagaraFunctionLibrary::SpawnSystemAtLocation(this, System, At, FRotator::ZeroRotator, FVector(Scale), true, true, ENCPoolMethod::AutoRelease);
}

void ALightGameMode::BeginPlay()
{
    Super::BeginPlay();
    FGameAssets::EnsureLoaded();
    if (auto* Save = Cast<ULightSave>(UGameplayStatics::LoadGameFromSlot(TEXT("PathOfLight"), 0))) Best = Save->Best;
    UWorld* World = GetWorld();
    for (int32 i = 0; i < 16; ++i)
    {
        auto* Spark = World->SpawnActor<ALightSpark>();
        Sparks.Add(Spark);
    }
    for (int32 i = 0; i < 60; ++i)
    {
        auto* Bolt = World->SpawnActor<ALightMagicBolt>();
        Bolts.Add(Bolt);
    }
    ChariotDistance = 32.f;
    ProcessionX = -3200.f;
    ProcessionPause = 0.f;
    ObstaclesBlasted = 0;
    MissedObstacles = 0;

    for (int32 Segment = 0; Segment < 18; ++Segment)
    {
        const float X = Segment * 6000.f;
        const bool Storm = Segment >= 7 && Segment < 13;
        const bool Twilight = Segment >= 13;

        // Warm Rajasthan sandstone palette & festival silk hues
        const FLinearColor Stall = Storm ? FLinearColor(0.2f, 0.45f, 0.48f) : Twilight ? FLinearColor(0.55f, 0.18f, 0.42f) : FLinearColor(0.95f, 0.55f, 0.12f);

        // Sub-road invisible physics bed (prevents any seam snagging or falling)
        auto* SubBed = Block(World, FVector(X + 3000, 0, -60), FVector(60, 14.f, 1), FLinearColor::Black);
        SubBed->SetActorHiddenInGame(true);

        // 100% Real Modular 3D Kenney Road Tiles with Sidewalks, Curbs & Textures
        for (int32 r = 0; r < 6; ++r)
        {
            const float TileX = X + 500.f + r * 1000.f;
            auto* RoadTile = World->SpawnActor<AStaticMeshActor>(FVector(TileX, 0.f, -10.f), FRotator::ZeroRotator);
            if (RoadTile && RoadTile->GetStaticMeshComponent())
            {
                RoadTile->SetMobility(EComponentMobility::Static);
                RoadTile->GetStaticMeshComponent()->SetStaticMesh(FGameAssets::RoadStraight);
                RoadTile->GetStaticMeshComponent()->SetCollisionProfileName(TEXT("BlockAll"));
            }
        }

        for (int32 b = 0; b < 4; ++b)
        {
            const float BuildX = X + 500.f + b * 1400.f;
            const bool bAlt = (b % 2 == 0);

            // Left Side Buildings (Y = -1360)
            const TCHAR* LeftMeshName = (b % 3 == 0) ? TEXT("building_a") : (b % 3 == 1) ? TEXT("building_b") : TEXT("building_c");
            if (UStaticMesh* LeftMesh = CityMesh(LeftMeshName))
            {
                auto* BLeft = Block(World, FVector(BuildX, -1360, 0), FVector(6.2f), FLinearColor(0.92f, 0.68f, 0.35f), LeftMesh);
                BLeft->SetActorRotation(FRotator(0, 0, 0));
            }
            // Right Side Buildings (Y = +1360)
            const TCHAR* RightMeshName = (b % 3 == 0) ? TEXT("building_b") : (b % 3 == 1) ? TEXT("building_c") : TEXT("building_a");
            if (UStaticMesh* RightMesh = CityMesh(RightMeshName))
            {
                auto* BRight = Block(World, FVector(BuildX + 150.f, 1360, 0), FVector(6.2f), FLinearColor(0.88f, 0.62f, 0.32f), RightMesh);
                BRight->SetActorRotation(FRotator(0, 180, 0));
            }

            // Shopfront Awnings, Banners, Parasols
            if (bAlt)
            {
                if (UStaticMesh* Awning = CityMesh(TEXT("detail_awning")))
                {
                    Block(World, FVector(BuildX, -1120, 175), FVector(3.2f, 3.2f, 3.2f), Stall, Awning);
                    Block(World, FVector(BuildX + 150.f, 1120, 175), FVector(3.2f, 3.2f, 3.2f), Stall * 0.9f, Awning)->SetActorRotation(FRotator(0, 180, 0));
                }
                if (UStaticMesh* Banner = CityMesh(TEXT("banner_red")))
                {
                    auto* FlagL = Block(World, FVector(BuildX - 120, -960, 150), FVector(2.2f), FLinearColor(0.92f, 0.12f, 0.08f), Banner);
                    FlagL->SetActorEnableCollision(false);
                }
            }
            else
            {
                if (UStaticMesh* Parasol = CityMesh(TEXT("detail_parasol_a")))
                {
                    Block(World, FVector(BuildX, -1080, 20), FVector(2.8f), FLinearColor(0.98f, 0.55f, 0.15f), Parasol);
                }
                if (UStaticMesh* Banner = CityMesh(TEXT("banner_yellow")))
                {
                    auto* FlagR = Block(World, FVector(BuildX + 120, 960, 150), FVector(2.2f), FLinearColor(0.98f, 0.78f, 0.15f), Banner);
                    FlagR->SetActorEnableCollision(false);
                }
            }

            // Street Furniture: Streetlights, Trees, Benches, Crates, Barrels
            if (b == 1 || b == 3)
            {
                Block(World, FVector(BuildX + 60, -1040, 20), FVector(1.6f), FLinearColor(0.45f, 0.28f, 0.14f), CityMesh(TEXT("barrel_large")));
                Block(World, FVector(BuildX - 40, 1040, 20), FVector(1.4f), FLinearColor(0.48f, 0.30f, 0.16f), CityMesh(TEXT("crates_stacked")));
                Block(World, FVector(BuildX, -1050, 40), FVector(0.8f, 0.8f, 2.4f), FLinearColor(0.35f, 0.28f, 0.18f), KayKit(TEXT("streetlight")));
                if (UStaticMesh* Tree = CityMesh(TEXT("tree_default")))
                {
                    Block(World, FVector(BuildX, 1140, 0), FVector(4.2f), FLinearColor(0.2f, 0.45f, 0.18f), Tree);
                }
                if (UStaticMesh* Bench = KayKit(TEXT("bench")))
                {
                    Block(World, FVector(BuildX, -1020, 20), FVector(1.8f), FLinearColor(0.4f, 0.25f, 0.15f), Bench);
                }
            }
        }

        for (float ArchX : { X + 1500.f, X + 4500.f })
        {
            UStaticMesh* Post = KayKit(TEXT("streetlight"));
            UStaticMesh* Cloth = CityMesh((ArchX > X + 2000.f) ? TEXT("banner_yellow") : TEXT("banner_red"));
            auto* PL = Block(World, FVector(ArchX, -620, 0), FVector(1.8f, 1.8f, 2.6f), FLinearColor(0.4f, 0.22f, 0.1f), Post ? Post : CubeMesh());
            auto* PR = Block(World, FVector(ArchX, 620, 0), FVector(1.8f, 1.8f, 2.6f), FLinearColor(0.4f, 0.22f, 0.1f), Post ? Post : CubeMesh());
            PL->SetActorEnableCollision(false); PR->SetActorEnableCollision(false);
            if (Cloth)
            {
                auto* Flag = Block(World, FVector(ArchX, 0, 240), FVector(2.4f, 3.6f, 2.2f), FLinearColor(0.92f, 0.14f, 0.08f), Cloth);
                Flag->SetActorEnableCollision(false);
            }
        }

        // 5. GLOWING CLAY DIYAS ALONG THE CURBS
        SpawnDiya(this, FVector(X + 2000, -640, 30), Twilight ? 1800.f : 1200.f);
        SpawnDiya(this, FVector(X + 4000, 640, 30), Twilight ? 1800.f : 1200.f);
        for (int32 c = 0; c < 2; ++c)
        {
            const float CrowdX = X + 900.f + c * 2800.f;
            const float CrowdY = (c == 0) ? -780.f : 780.f;
            UStaticMesh* Parasol = CityMesh(TEXT("detail_parasol_a"));
            if (Parasol) Block(World, FVector(CrowdX, CrowdY, 10), FVector(2.2f), FLinearColor(0.98f, 0.5f, 0.12f), Parasol)->SetActorEnableCollision(false);
            auto* Person = World->SpawnActor<ALightCitizen>();
            Person->Configure(FVector(CrowdX, CrowdY * 0.88f, 40), FLinearColor(0.95f, 0.45f, 0.12f));
            Citizens.Add(Person);
        }

        // ════════════════════════════════════════════════════════════════════════════════
        // SACRED ARCADE RUNNER: 3-LANE DEMONIC ASURAS, ASTRA SHRINES & HELLFIRE FIENDS
        // Lanes: Left (-300), Center (0), Right (+300)
        // ════════════════════════════════════════════════════════════════════════════════
        if (Segment == 0)
        {
            // Intro segment:
            // Wave 1: Center Hellfire Fiend at X=2000 (Shoot to trigger roaring chain explosion!)
            auto* B1 = World->SpawnActor<ALightProp>();
            B1->Configure(ETailKind::Fiend, FVector(X + 2000, 0.f, 70), FVector(1.4f), false, true /* Explosive */);
            Props.Add(B1);

            // Wave 2: Left Hellfire Fiend, Right Asura Minion at X=3200
            auto* BL = World->SpawnActor<ALightProp>();
            BL->Configure(ETailKind::Fiend, FVector(X + 3200, -300.f, 70), FVector(1.3f), false, true /* Explosive */);
            Props.Add(BL);
            auto* BR = World->SpawnActor<ALightProp>();
            BR->Configure(ETailKind::Minion, FVector(X + 3200, 300.f, 70), FVector(1.4f), false, false);
            Props.Add(BR);

            // First Astra Shrine: Shiva's Agni Trishul at X=4200 Center!
            auto* Up1 = World->SpawnActor<ALightPowerUp>();
            Up1->Configure(EPowerUpType::WeaponTrishul, FVector(X + 4200, 0.f, 70.f));
            PowerUps.Add(Up1);

            // Wave 3: Two-demon barricade at X=5200 (Left Charging Rakshasa Brute, Center Asura Minion)
            auto* C1 = World->SpawnActor<ALightProp>();
            C1->Configure(ETailKind::Brute, FVector(X + 5200, -300.f, 80), FVector(1.7f), false, false, -240.f /* charging */);
            Props.Add(C1);
            auto* C2 = World->SpawnActor<ALightProp>();
            C2->Configure(ETailKind::Minion, FVector(X + 5200, 0.f, 70), FVector(1.4f), false, false);
            Props.Add(C2);
        }
        else
        {
            // Wave A at X + 1750 (spaced cleanly past the X + 1500 Archway):
            const int32 PatternA = Segment % 3;
            if (PatternA == 0)
            {
                // Hellfire Fiend on Left lane, Asura Minion on Right lane
                auto* P1 = World->SpawnActor<ALightProp>();
                P1->Configure(ETailKind::Fiend, FVector(X + 1750.f, -300.f, 70), FVector(1.4f), false, true /* Explosive */);
                Props.Add(P1);
                auto* P2 = World->SpawnActor<ALightProp>();
                P2->Configure(ETailKind::Minion, FVector(X + 1750.f, 300.f, 70), FVector(1.4f), false, false);
                Props.Add(P2);
            }
            else if (PatternA == 1)
            {
                // Charging Rakshasa Brute charging at the runner in Center!
                auto* Brute = World->SpawnActor<ALightProp>();
                Brute->Configure(ETailKind::Brute, FVector(X + 1750.f, 0.f, 80), FVector(1.8f), false, false, -340.f /* Charging speed */);
                Props.Add(Brute);
            }
            else
            {
                // Left Hellfire Fiend & Center Asura Minion
                auto* P1 = World->SpawnActor<ALightProp>();
                P1->Configure(ETailKind::Fiend, FVector(X + 1750.f, -300.f, 70), FVector(1.4f), false, true /* Explosive */);
                Props.Add(P1);
                auto* P2 = World->SpawnActor<ALightProp>();
                P2->Configure(ETailKind::Minion, FVector(X + 1750.f, 0.f, 70), FVector(1.4f), false, false);
                Props.Add(P2);
            }

            // Power-Up / Astra Shrine at X + 2300:
            if (Segment == 1)
            {
                auto* Wep = World->SpawnActor<ALightPowerUp>();
                Wep->Configure(EPowerUpType::WeaponVajra, FVector(X + 2300, 0.f, 70.f));
                PowerUps.Add(Wep);
            }
            else if (Segment == 2)
            {
                auto* Wep = World->SpawnActor<ALightPowerUp>();
                Wep->Configure(EPowerUpType::WeaponTrishul, FVector(X + 2300, 0.f, 70.f));
                PowerUps.Add(Wep);
            }
            else if (Segment == 3 || Segment == 6 || Segment == 10 || Segment == 15 || Segment == 17)
            {
                auto* Wep = World->SpawnActor<ALightPowerUp>();
                Wep->Configure(EPowerUpType::WeaponChakra, FVector(X + 2300, 0.f, 70.f));
                PowerUps.Add(Wep);
            }
            else if (Segment == 4 || Segment == 11)
            {
                auto* Wep = World->SpawnActor<ALightPowerUp>();
                Wep->Configure(EPowerUpType::WeaponVajra, FVector(X + 2300, 0.f, 70.f));
                PowerUps.Add(Wep);
            }
            else if (Segment == 7 || Segment == 14)
            {
                auto* Wep = World->SpawnActor<ALightPowerUp>();
                Wep->Configure(EPowerUpType::WeaponTrishul, FVector(X + 2300, 0.f, 70.f));
                PowerUps.Add(Wep);
            }
            else if (Segment == 8)
            {
                auto* Wep = World->SpawnActor<ALightPowerUp>();
                Wep->Configure(EPowerUpType::WeaponChakra, FVector(X + 2300, 0.f, 70.f));
                PowerUps.Add(Wep);
            }
            else if (Segment % 2 == 1)
            {
                // Sacred Bell to push Chariot back (+15m) and restore Bells!
                auto* Bell = World->SpawnActor<ALightPowerUp>();
                const float BellLane = (Segment % 4 == 1) ? -300.f : 300.f;
                Bell->Configure(EPowerUpType::SacredBell, FVector(X + 2300, BellLane, 70.f));
                PowerUps.Add(Bell);
            }
            else
            {
                // Prasad Modak
                auto* Modak = World->SpawnActor<ALightPowerUp>();
                Modak->Configure(EPowerUpType::Modak, FVector(X + 2300, 0.f, 70.f));
                PowerUps.Add(Modak);
            }

            // Wave B at X + 3400:
            if (Segment % 3 == 0)
            {
                // Towering Mahishasura Gate spanning across the street (Health = 6)
                auto* Strip = Block(World, FVector(X + 3400, 0, 3), FVector(4.5f, 9.5f, 0.08f), FLinearColor(0.95f, 0.08f, 0.05f));
                Strip->SetActorEnableCollision(false);
                auto* Gate = World->SpawnActor<ALightProp>();
                Gate->FloorStrip = Strip;
                Gate->Configure(ETailKind::DemonGate, FVector(X + 3400, 0, 120), FVector(1.1f), true);
                Gate->Health = 6;
                Props.Add(Gate);
            }
            else
            {
                // Charging Rakshasa Brute + Hellfire Fiend
                auto* Brute = World->SpawnActor<ALightProp>();
                const float BruteLane = (Segment % 2 == 0) ? -300.f : 300.f;
                Brute->Configure(ETailKind::Brute, FVector(X + 3400, BruteLane, 80), FVector(1.8f), false, false, -280.f /* Charging speed */);
                Props.Add(Brute);
                auto* P = World->SpawnActor<ALightProp>();
                P->Configure(ETailKind::Fiend, FVector(X + 3400, 0.f, 70), FVector(1.4f), false, true /* Explosive */);
                Props.Add(P);
            }

            // Wave C at X + 4800:
            const float SafeLane = (Segment % 3 == 0) ? 0.f : (Segment % 3 == 1) ? 300.f : -300.f;
            for (float LaneY : { -300.f, 0.f, 300.f })
            {
                if (FMath::IsNearlyEqual(LaneY, SafeLane))
                {
                    // Bonus Modak on safe lane
                    auto* Modak = World->SpawnActor<ALightPowerUp>();
                    Modak->Configure(EPowerUpType::Modak, FVector(X + 4800, LaneY, 70.f));
                    PowerUps.Add(Modak);
                }
                else
                {
                    auto* Demon = World->SpawnActor<ALightProp>();
                    const bool bExp = (Segment % 2 == 0 && LaneY < 0.f);
                    Demon->Configure(bExp ? ETailKind::Fiend : ETailKind::Minion, FVector(X + 4800, LaneY, 70), FVector(1.4f), false, bExp);
                    Props.Add(Demon);
                }
            }
        }
    }
    Block(World, FVector(FinishX + 2000, 0, -60), FVector(40, 22, 1), FLinearColor(0.1f, 0.08f, 0.18f))->SetActorHiddenInGame(true);
    for (int32 r = 0; r < 6; ++r)
    {
        const float TileX = FinishX + 500.f + r * 1000.f;
        auto* RoadTile = World->SpawnActor<AStaticMeshActor>(FVector(TileX, 0.f, -10.f), FRotator::ZeroRotator);
        if (RoadTile && RoadTile->GetStaticMeshComponent())
        {
            RoadTile->SetMobility(EComponentMobility::Static);
            RoadTile->GetStaticMeshComponent()->SetStaticMesh(FGameAssets::RoadStraight);
            RoadTile->GetStaticMeshComponent()->SetCollisionProfileName(TEXT("BlockAll"));
        }
    }
    for (int32 i = 0; i < 4; ++i)
    {
        SpawnDiya(this, FVector(FinishX + i * 400.f - 400.f, (i % 2 ? -520.f : 520.f), 50), 2800.f);
    }
    Sun = World->SpawnActor<ADirectionalLight>(FVector(0, 0, 1500), FRotator(-45, -30, 0));
    if (Sun) Sun->SetMobility(EComponentMobility::Movable);
    if (auto* SunComp = Sun ? Sun->GetComponentByClass<UDirectionalLightComponent>() : nullptr)
    {
        SunComp->bEnableLightShaftOcclusion = false;
        SunComp->SetCastShadows(false);
        SunComp->DynamicShadowDistanceMovableLight = 0.f;
    }
    Fog = World->SpawnActor<AExponentialHeightFog>(FVector(0, 0, 400), FRotator::ZeroRotator);
    if (auto* FogComp = Fog ? Fog->GetComponentByClass<UExponentialHeightFogComponent>() : nullptr)
    {
        FogComp->SetVolumetricFog(false);
        FogComp->SetFogDensity(0.012f);
        FogComp->SetFogHeightFalloff(0.2f);
        FogComp->SetFogInscatteringColor(FLinearColor(1.f, 0.82f, 0.55f));
    }
    World->SpawnActor<ASkyAtmosphere>(FVector::ZeroVector, FRotator::ZeroRotator);
    if (auto* Sky = World->SpawnActor<ASkyLight>(FVector(0, 0, 800), FRotator::ZeroRotator))
    {
        if (USkyLightComponent* SkyComp = Sky->GetLightComponent())
        {
            if (UTextureCube* Cube = LoadObject<UTextureCube>(nullptr, TEXT("/Game/Env/kiara_1_dawn.kiara_1_dawn")))
            {
                SkyComp->SetCubemap(Cube);
                SkyComp->SourceType = ESkyLightSourceType::SLS_SpecifiedCubemap;
            }
            SkyComp->SetIntensity(1.85f);
            SkyComp->SetLightColor(FLinearColor(1.f, 0.9f, 0.74f));
        }
    }
    if (auto* Film = World->SpawnActor<APostProcessVolume>(FVector::ZeroVector, FRotator::ZeroRotator))
    {
        Film->bUnbound = true;
        Film->BlendWeight = 1.f;
        // 2026 Cinematic ACES Tone Mapping & Rich Festival Color Grade
        Film->Settings.bOverride_BloomIntensity = true;
        Film->Settings.BloomIntensity = 1.15f;
        Film->Settings.bOverride_BloomThreshold = true;
        Film->Settings.BloomThreshold = 0.45f;
        Film->Settings.bOverride_VignetteIntensity = true;
        Film->Settings.VignetteIntensity = 0.35f;
        Film->Settings.bOverride_AutoExposureBias = true;
        Film->Settings.AutoExposureBias = 0.35f;
        Film->Settings.bOverride_FilmSlope = true;
        Film->Settings.FilmSlope = 0.88f;
        Film->Settings.bOverride_FilmToe = true;
        Film->Settings.FilmToe = 0.55f;
        Film->Settings.bOverride_FilmShoulder = true;
        Film->Settings.FilmShoulder = 0.28f;
        Film->Settings.bOverride_ColorSaturation = true;
        Film->Settings.ColorSaturation = FVector4(1.22f, 1.14f, 1.05f, 1.0f);
        Film->Settings.bOverride_ColorContrast = true;
        Film->Settings.ColorContrast = FVector4(1.10f, 1.06f, 1.02f, 1.0f);
        Film->Settings.bOverride_SceneFringeIntensity = true;
        Film->Settings.SceneFringeIntensity = 0.45f;
    }
    Procession = World->SpawnActor<ALightRath>();
    if (Procession)
    {
        Procession->InitRath();
        Procession->Drive(ProcessionX, 0.f, 0.f);
    }
    if (auto* Runner = Cast<ALightRunner>(UGameplayStatics::GetPlayerPawn(this, 0)))
    {
        Runner->SetActorLocation(FVector(100, 0, 100));
    }
    ApplyLook(0.f);
    if (UGameplayStatics::HasOption(OptionsString, TEXT("retry"))) StartRun();
}

void ALightGameMode::ApplyLook(float PlayerX)
{
    // Match the authored segment boundaries (7 and 13 out of 18).
    const bool Storm = PlayerX >= 42000.f && PlayerX < 78000.f;
    const bool Twilight = PlayerX >= 78000.f;
    const int32 NewBand = Twilight ? 2 : Storm ? 1 : 0;
    if (LookBand == NewBand) return;
    LookBand = NewBand;
    if (Sun)
    {
        Sun->SetActorRotation(Storm ? FRotator(-28, -40, 0) : Twilight ? FRotator(-18, -10, 0) : FRotator(-45, -30, 0));
        if (auto* Light = Sun->FindComponentByClass<ULightComponent>())
        {
            Light->SetIntensity(Storm ? 3.6f : Twilight ? 6.4f : 9.f);
            Light->SetLightColor(Storm ? FLinearColor(0.55f, 0.62f, 0.78f) : Twilight ? FLinearColor(0.45f, 0.28f, 0.75f) : FLinearColor(1.f, 0.72f, 0.38f));
        }
    }
    if (UExponentialHeightFogComponent* FogComp = Fog ? Fog->GetComponent() : nullptr)
    {
        FogComp->SetFogDensity(Storm ? 0.04f : Twilight ? 0.018f : 0.011f);
        FogComp->SetFogInscatteringColor(Storm ? FLinearColor(0.25f, 0.32f, 0.4f) : Twilight ? FLinearColor(0.18f, 0.08f, 0.28f) : FLinearColor(0.62f, 0.38f, 0.18f));
    }
}

float ALightGameMode::GapMeters(const ALightRunner* Runner) const
{
    return ChariotDistance;
}

void ALightGameMode::Burst(int32 Count, FVector At, FLinearColor Color, float Up)
{
    if (Sparks.Num() == 0) return;
    for (int32 i = 0; i < Count; ++i)
    {
        ALightSpark* Spark = Sparks[SparkIndex++ % Sparks.Num()];
        if (!Spark) continue;
        const FVector Kick(FMath::FRandRange(-420.f, 420.f), FMath::FRandRange(-420.f, 420.f), FMath::FRandRange(Up * 0.4f, Up));
        Spark->Launch(At + FVector(0, 0, 40), Kick, Color, FMath::FRandRange(0.45f, 0.9f));
    }
}

void ALightGameMode::RestoreTime()
{
    if (!bPaused) UGameplayStatics::SetGlobalTimeDilation(this, 1.f);
}

void ALightGameMode::Juice(float Punch, int32 Petals, FVector At, FLinearColor Color)
{
    CameraPunch = FMath::Min(0.25f, FMath::Max(CameraPunch, Punch * 0.25f));
    Shake = FMath::Min(0.2f, FMath::Max(Shake, Punch * 0.2f));
    Burst(FMath::Min(Petals, 6), At, Color, 420.f);
}

void ALightGameMode::MarkPath(const FVector& At)
{
    UWorld* World = GetWorld();
    if (!World) return;
    AActor* Mark = nullptr;
    if (PathMarks.Num() < 72)
    {
        Mark = Block(World, FVector(At.X, At.Y, 4), FVector(1.8f, 0.8f, 0.07f), FLinearColor(1.f, 0.78f, 0.22f));
        Mark->SetActorEnableCollision(false);
        PathMarks.Add(Mark);
    }
    else
    {
        Mark = PathMarks[PathIndex % PathMarks.Num()];
        PathIndex++;
        if (Mark) Mark->SetActorLocation(FVector(At.X, At.Y, 4));
    }
}

void ALightGameMode::TriggerChain(ALightProp* Source)
{
    if (!Source || !bRunning) return;
    int32 Hits = 0;
    for (ALightProp* Prop : Props)
    {
        if (!IsValid(Prop) || Prop == Source || Prop->bCleared) continue;
        if (FVector::DistSquared(Prop->GetActorLocation(), Source->Home) > FMath::Square(2200.f)) continue;
        if (Prop->Kind == ETailKind::Light && Prop->Mesh->IsSimulatingPhysics())
        {
            Prop->Mesh->AddImpulse(FVector(400, 0, 700), NAME_None, true);
            Hits++;
        }
        else if (Prop->Kind == ETailKind::Cart && Prop->Mesh->IsSimulatingPhysics())
        {
            Prop->Mesh->AddImpulse(FVector(900, 0, 80), NAME_None, true);
            Hits++;
        }
    }
    if (Hits > 0)
    {
        PhysicsChains++;
        Award(120 * Hits, TEXT(""));
        Juice(0.85f, 20, Source->Home, FLinearColor(1.f, 0.45f, 0.12f));
        // Ultra VFX: explosion at chain reaction source
        PlayFX(FXBoom, Source->Home + FVector(0, 0, 60), 0.3f);
    }
}

void ALightGameMode::TickDirector(float Delta, ALightRunner* Runner)
{
    if (!Runner) return;
    PhaseLeft -= Delta;
    const bool Struggling = Bells < 3 || (Flow <= 1 && Elapsed > 10.f);
    const bool Dominating = Flow >= 6 || Surge > 0;
    if (PhaseLeft <= 0.f)
    {
        if (Phase == EFeelPhase::Control)
        {
            Phase = EFeelPhase::Chaos;
            PhaseLeft = Struggling ? 8.f : 8.f + FMath::FRand() * 7.f;
            bChaosDrop = false; bCrowdDash = false;
            Shake = FMath::Max(Shake, 0.35f);
        }
        else if (Phase == EFeelPhase::Chaos)
        {
            Phase = EFeelPhase::Release;
            PhaseLeft = 3.f + FMath::FRand() * 5.f;
            Burst(10, Runner->GetActorLocation(), FLinearColor(1.f, 0.8f, 0.3f), 500.f);
        }
        else
        {
            Phase = EFeelPhase::Control;
            PhaseLeft = Struggling ? 16.f : 10.f + FMath::FRand() * 8.f;
        }
    }
    if (Phase == EFeelPhase::Chaos && Dominating && !bChaosDrop)
    {
        bChaosDrop = true;
        if (auto* Basket = GetWorld()->SpawnActor<ALightProp>())
        {
            const FVector Ahead = Runner->GetActorLocation() + FVector(1600.f, FMath::RandRange(-180.f, 180.f), 720.f);
            Basket->Configure(ETailKind::Light, Ahead, FVector(0.55f));
            Props.Add(Basket);
        }
    }
    if (Phase == EFeelPhase::Chaos && !bCrowdDash && Citizens.Num() > 0)
    {
        bCrowdDash = true;
        ALightCitizen* Dash = nullptr;
        float Nearest = FLT_MAX;
        for (ALightCitizen* Person : Citizens)
        {
            if (!IsValid(Person)) continue;
            const float Dx = FMath::Abs(Person->Home.X - (Runner->GetActorLocation().X + 900.f));
            if (Dx < Nearest) { Nearest = Dx; Dash = Person; }
        }
        if (Dash) Dash->Dash = 1.4f;
    }
    if (Phase != EFeelPhase::Chaos) { bChaosDrop = false; bCrowdDash = false; }
}

void ALightGameMode::StartRun()
{
    if (bFinished) { UGameplayStatics::OpenLevel(this, FName("TailLab"), true, TEXT("retry")); return; }
    if (bRunning) return;
    Cue = TEXT("CLEAR THE PATH"); CueUntil = 1.2f;
    bRunning = true;
    IntroLeft = 2.6f;
    if (Music)
    {
        USoundBase* Bed = LoadObject<USoundBase>(nullptr, TEXT("/Game/Audio/india_rhythm.india_rhythm"));
        if (!Bed) Bed = LoadObject<USoundBase>(nullptr, TEXT("/Game/Audio/tabla_tune.tabla_tune"));
        if (Bed)
        {
            Bed->AddToRoot();
            Music->SetSound(Bed);
            Music->SetVolumeMultiplier(0.70f);
            Music->Play();
        }
    }
    if (CrowdBed)
    {
        if (USoundBase* Crowd = LoadObject<USoundBase>(nullptr, TEXT("/Game/Audio/crowd_shouting.crowd_shouting")))
        {
            Crowd->AddToRoot();
            CrowdBed->SetSound(Crowd);
            CrowdBed->SetVolumeMultiplier(0.20f);
            CrowdBed->Play();
        }
    }
    PlayCue(TEXT("/Game/Audio/bell_hit.bell_hit"), 0.6f);
    Phase = EFeelPhase::Control;
    PhaseLeft = 14.f;
    Burst(12, FVector(100, 0, 120), FLinearColor(1.f, 0.7f, 0.15f), 600.f);
}

void ALightGameMode::Award(int32 Points, const FString& Message)
{
    if (!bRunning) return;
    Chain++; Flow = Chain >= 24 ? 12 : Chain >= 16 ? 8 : Chain >= 10 ? 6 : Chain >= 6 ? 4 : Chain >= 3 ? 2 : 1;
    MaxFlow = FMath::Max(MaxFlow, Flow);
    Score += Points * Flow * (Surge > 0 ? 2 : 1);
    FlowExpiry = Elapsed + 8;
    const bool Important = Message.Contains(TEXT("AWAKENED")) || Message.Contains(TEXT("BELL"));
    if (!Message.IsEmpty() && (Important || Elapsed >= CueUntil))
    {
        Cue = Message;
        CueUntil = Elapsed + (Important ? 1.8f : 0.7f);
    }
    if (Chain == 24)
    {
        Surge = 8; Cue = TEXT("SEVA SURGE"); CueUntil = Elapsed + 1.8f;
        PlayCue(TEXT("/Game/Audio/jingle_surge.jingle_surge"), 0.95f);
        if (auto* Mouse = Cast<ALightRunner>(UGameplayStatics::GetPlayerPawn(this, 0)))
        {
            PlayFX(FXBurst, Mouse->GetActorLocation(), 0.4f);
            // Epic fountain celebration VFX
            PlayFX(FXFountain, Mouse->GetActorLocation() + FVector(0, 0, 60), 0.5f);
        }
        if (auto* Runner = Cast<ALightRunner>(UGameplayStatics::GetPlayerPawn(this, 0)))
            Juice(1.4f, 28, Runner->GetActorLocation(), FLinearColor(1.f, 0.85f, 0.2f));
        // Brief epic slow-mo moment
        UGameplayStatics::SetGlobalTimeDilation(this, 0.25f);
        GetWorldTimerManager().SetTimer(SlowMoTimer, this, &ALightGameMode::RestoreTime, 0.03f, false);
    }
    if (auto* Runner = Cast<ALightRunner>(UGameplayStatics::GetPlayerPawn(this, 0)))
    {
        MarkPath(Runner->GetActorLocation());
    }
}

void ALightGameMode::Stumble()
{
    Chain = 0; Flow = 1; Surge = 0;
    Cue = TEXT("STUMBLED - FLOW LOST"); CueUntil = Elapsed + 1.4f;
    Shake = FMath::Max(Shake, 0.35f);
    VignetteKick = 0.35f;
    PlayCue(TEXT("/Game/Audio/wood_heavy.wood_heavy"), 0.7f);
    if (auto* Runner = Cast<ALightRunner>(UGameplayStatics::GetPlayerPawn(this, 0)))
    {
        PlayFX(FXBoom, Runner->GetActorLocation() + FVector(0, 0, 30), 0.16f);
        Runner->FOVKick = -4.f;
        Runner->Trauma = FMath::Max(Runner->Trauma, 0.3f);
    }
}

void ALightGameMode::Tick(float Delta)
{
    Super::Tick(Delta);
    if (!bRunning || bPaused) return;
    if (!CachedRunner)
    {
        CachedRunner = Cast<ALightRunner>(UGameplayStatics::GetPlayerPawn(this, 0));
    }
    auto* Runner = CachedRunner.Get();
    if (!Runner) return;
    Elapsed += Delta; Surge = FMath::Max(0.f, Surge - Delta);
    IntroLeft = FMath::Max(0.f, IntroLeft - Delta);

    if (!bPaused && UGameplayStatics::GetGlobalTimeDilation(this) < 0.95f)
    {
        if (!GetWorldTimerManager().IsTimerActive(SlowMoTimer))
        {
            UGameplayStatics::SetGlobalTimeDilation(this, 1.f);
        }
    }

    // Independent Rath pursuit simulation:
    const float ProgressRatio = FMath::Clamp(Runner->GetActorLocation().X / FinishX, 0.f, 1.f);
    if (ProcessionPause > 0.f)
    {
        ProcessionPause -= Delta;
    }
    else
    {
        const float RathSpeed = 820.f + ProgressRatio * 260.f; // 8.2 m/s up to 10.8 m/s
        ProcessionX += RathSpeed * Delta;
    }
    ChariotDistance = FMath::Clamp((Runner->GetActorLocation().X - ProcessionX) / 100.f, 0.f, 70.f);

    // High tension sound cues:
    GrindCooldown -= Delta;
    AlarmCooldown -= Delta;
    if (ChariotDistance < 22.f && GrindCooldown <= 0.f)
    {
        PlayCue(TEXT("/Game/Audio/rath_grind.rath_grind"), 0.85f);
        GrindCooldown = FMath::Lerp(1.2f, 2.8f, FMath::Clamp((ChariotDistance - 10.f) / 12.f, 0.f, 1.f));
    }
    if (ChariotDistance < 14.f && AlarmCooldown <= 0.f)
    {
        PlayCue(TEXT("/Game/Audio/alarm_pulse.alarm_pulse"), 0.95f);
        AlarmCooldown = FMath::Lerp(0.55f, 1.1f, FMath::Clamp(ChariotDistance / 14.f, 0.f, 1.f));
        Shake = FMath::Max(Shake, 0.45f);
        VignetteKick = 0.5f;
    }

    // 0 METERS CATCH CONDITION: Chariot overtakes Mooshak!
    if (ChariotDistance <= 0.f)
    {
        Cue = TEXT("CHARIOT OVERTAKEN! CAUGHT BY THE RATH!");
        CueUntil = Elapsed + 3.0f;
        Shake = 2.0f;
        VignetteKick = 1.0f;
        Runner->Trauma = 2.0f;
        PlayCue(TEXT("/Game/Audio/wood_heavy.wood_heavy"), 1.0f);
        PlayCue(TEXT("/Game/Audio/bell_hit.bell_hit"), 1.0f);
        Finish(false);
        return;
    }

    const float HBGap = ChariotDistance;
    if (CrowdBed && CrowdBed->IsPlaying())
    {
        const float Near = FMath::Clamp((60.f - HBGap) / 60.f, 0.1f, 0.95f);
        CrowdBed->SetVolumeMultiplier(Near * (Phase == EFeelPhase::Chaos ? 1.15f : 0.85f));
    }
    if (Music && Music->IsPlaying())
    {
        const float PanicPitch = FMath::Lerp(1.f, 1.08f, FMath::Clamp(1.f - HBGap / 25.f, 0.f, 1.f));
        const float PhasePitch = Phase == EFeelPhase::Chaos ? 1.04f : Phase == EFeelPhase::Release ? 0.98f : 1.f;
        Music->SetPitchMultiplier(FMath::Min(PanicPitch * PhasePitch * (Surge > 0 ? 1.05f : 1.f), 1.14f));
        Music->SetVolumeMultiplier(Surge > 0 ? 0.8f : Phase == EFeelPhase::Chaos ? 0.68f : 0.52f);
    }
    if (Elapsed > FlowExpiry) { Chain = 0; Flow = 1; }
    TickDirector(Delta, Runner);
    ApplyLook(Runner->GetActorLocation().X);

    // Rath collision with uncleared red gates
    for (ALightProp* Prop : Props)
    {
        if (!IsValid(Prop) || !Prop->bGate || Prop->bCleared) continue;
        if (ProcessionX >= Prop->Home.X - 400.f)
        {
            Bells--; Prop->Clear();
            ProcessionPause = 2.0f;
            ChariotDistance = FMath::Max(0.f, ChariotDistance - 8.f);
            ProcessionX = Runner->GetActorLocation().X - ChariotDistance * 100.f;
            Cue = TEXT("RATH COLLISION! BELL CRACKED!"); CueUntil = Elapsed + 2.0f;
            PlayCue(TEXT("/Game/Audio/wood_heavy.wood_heavy"), 1.0f);
            PlayCue(TEXT("/Game/Audio/bell_hit.bell_hit"), 1.0f);
            Shake = FMath::Max(Shake, 1.8f);
            VignetteKick = 1.0f;
            Runner->Trauma = 1.5f;
            Runner->FOVKick = -12.f;
            Juice(1.2f, 20, Prop->Home, FLinearColor(1.f, 0.1f, 0.05f));
            PlayFX(FXBoom, Prop->Home + FVector(0, 0, 60), 0.8f);
            PlayFX(FXBurst, Prop->Home + FVector(0, 0, 80), 0.6f);
            UGameplayStatics::SetGlobalTimeDilation(this, 0.06f);
            GetWorldTimerManager().SetTimer(SlowMoTimer, this, &ALightGameMode::RestoreTime, 0.006f, false);
            if (Bells <= 0) { Finish(false); return; }
            break;
        }
    }

    const float Panic = HBGap < 12.f ? 1.f : HBGap < 25.f ? 0.6f : HBGap < 40.f ? 0.3f : 0.f;
    if (Procession) Procession->Drive(ProcessionX, Panic, Delta);

    const int32 Band = HBGap > 50.f ? 0 : HBGap > 35.f ? 1 : HBGap > 25.f ? 2 : HBGap > 15.f ? 3 : HBGap > 10.f ? 4 : 5;
    if (Band != Intensity)
    {
        Intensity = Band;
        if (Band >= 3) Shake = FMath::Max(Shake, 0.2f + Band * 0.06f);
        if (Band >= 4) VignetteKick = FMath::Max(VignetteKick, 0.35f);
    }
    if (Procession)
    {
        if (Procession->LampL) Procession->LampL->SetVisibility(Bells >= 3);
        if (Procession->LampR) Procession->LampR->SetVisibility(Bells >= 2);
        if (Procession->Idol) Tint(Procession->Idol, FLinearColor(1.f, 0.82f, 0.2f), Bells <= 1 ? 3.2f : 1.1f);
    }
    if (Runner->GetActorLocation().X >= FinishX)
    {
        Finish(true);
    }
}

void ALightGameMode::Finish(bool Won)
{
    if (bFinished) return;
    if (auto* Mouse = Cast<ALightRunner>(UGameplayStatics::GetPlayerPawn(this, 0))) Mouse->CancelTail();
    GetWorldTimerManager().ClearTimer(SlowMoTimer);
    for (ALightMagicBolt* Bolt : Bolts) if (IsValid(Bolt)) Bolt->Deactivate();
    bRunning = false; bFinished = true; bWon = Won;
    UGameplayStatics::SetGlobalTimeDilation(this, 1.f);
    Score += Won ? (Bells * 1000 + ObstaclesBlasted * 150) : (ObstaclesBlasted * 100);
    Best = FMath::Max(Best, Score);
    auto* Save = Cast<ULightSave>(UGameplayStatics::CreateSaveGameObject(ULightSave::StaticClass()));
    Save->Best = Best; UGameplayStatics::SaveGameToSlot(Save, TEXT("PathOfLight"), 0);
    if (ACharacter* Character = UGameplayStatics::GetPlayerCharacter(this, 0)) Character->GetCharacterMovement()->DisableMovement();
    Cue = Won ? TEXT("THE PATH IS READY. GANPATI BAPPA MORYA!") : Bells <= 0 ? TEXT("ALL SACRED BELLS LOST - PROTECT THE RATH!") : TEXT("CAUGHT BY THE RATH - CLEAR THE ASURAS!");
    PlayCue(Won ? TEXT("/Game/Audio/jingle_surge.jingle_surge") : TEXT("/Game/Audio/wood_heavy.wood_heavy"), 1.f);
    if (Music) Music->Stop();
    if (CrowdBed) CrowdBed->FadeOut(1.2f, 0.f);
    if (Won)
    {
        Burst(30, FVector(FinishX, 0, 160), FLinearColor(1.f, 0.78f, 0.2f), 1100.f);
        PlayFX(FXBurst, FVector(FinishX, 0, 120), 0.5f);
        PlayFX(FXFountain, FVector(FinishX, 0, 80), 0.6f);
        PlayFX(FXTrail, FVector(FinishX, -300, 120), 0.35f);
        PlayFX(FXTrail, FVector(FinishX, 300, 120), 0.35f);
        UGameplayStatics::SetGlobalTimeDilation(this, 0.15f);
        GetWorldTimerManager().SetTimer(SlowMoTimer, this, &ALightGameMode::RestoreTime, 0.045f, false);
    }
}

void ALightHUD::DrawHUD()
{
    Super::DrawHUD();
    auto* Game = Mode(this);
    if (!Game || !Canvas) return;
    const FLinearColor Gold(1.f, 0.78f, 0.22f);
    const FLinearColor Red(0.95f, 0.15f, 0.10f);
    const FLinearColor White(0.95f, 0.95f, 0.95f);
    const FLinearColor Amber(0.95f, 0.65f, 0.20f);
    const FLinearColor Orange(1.f, 0.50f, 0.12f);
    const float CX = Canvas->SizeX * 0.5f;
    const float CY = Canvas->SizeY * 0.5f;

    // ═══════════════════════════════════════════
    // TITLE / RESULTS SCREEN
    // ═══════════════════════════════════════════
    if (!Game->bRunning)
    {
        DrawRect(FLinearColor(0.02f, 0.02f, 0.04f, 0.94f), 0, 0, Canvas->SizeX, Canvas->SizeY);

        if (Game->bFinished)
        {
            const TCHAR* Result = Game->bWon ? TEXT("GANPATI BAPPA MORYA! PATH CLEARED!") : *Game->Cue;
            const FLinearColor ResultColor = Game->bWon ? Gold : Red;
            DrawText(Result, ResultColor, CX - 320, CY - 150, nullptr, 2.2f);

            // Stats box
            DrawRect(FLinearColor(0.02f, 0.02f, 0.05f, 0.88f), CX - 260, CY - 80, 520, 170);
            DrawRect(ResultColor, CX - 260, CY - 80, 520, 2);

            DrawText(FString::Printf(TEXT("SEVA SCORE:         %d"), Game->Score), White, CX - 220, CY - 65, nullptr, 1.6f);
            DrawText(FString::Printf(TEXT("ASURAS BANISHED:    %d"), Game->ObstaclesBlasted), Gold, CX - 220, CY - 25, nullptr, 1.5f);
            DrawText(FString::Printf(TEXT("MISSED DEMONS:      %d"), Game->MissedObstacles), Game->MissedObstacles > 0 ? Red : White, CX - 220, CY + 15, nullptr, 1.5f);
            DrawText(FString::Printf(TEXT("BEST SCORE:         %d"), Game->Best), FLinearColor(0.7f, 0.7f, 0.7f), CX - 220, CY + 55, nullptr, 1.3f);

            const float PA = 0.6f + 0.4f * FMath::Sin(Game->Elapsed * 4.f);
            DrawText(TEXT("PRESS [ENTER] TO PLAY AGAIN"), Gold * PA, CX - 190, CY + 125, nullptr, 1.8f);
        }
        else
        {
            // Main Title
            DrawText(TEXT("VIGHNAHARTA: PATH OF LIGHT"), Gold, CX - 280, CY - 220, nullptr, 2.6f);

            // Arcade Badge
            DrawRect(FLinearColor(0.12f, 0.05f, 0.02f, 0.9f), CX - 240, CY - 165, 480, 36);
            DrawRect(Amber, CX - 240, CY - 165, 480, 2);
            DrawText(TEXT("SACRED DIVINE ASTRA SHOOTER & ARCADE RUNNER"), Amber, CX - 210, CY - 158, nullptr, 1.25f);

            // Core Mission Box
            DrawRect(FLinearColor(0.02f, 0.02f, 0.05f, 0.88f), CX - 380, CY - 110, 760, 75);
            DrawRect(Gold, CX - 380, CY - 110, 760, 2);
            DrawText(TEXT("HIGH-INTENSITY CHASE: BANISH EVERY ASURA OR GET OVERTAKEN!"), Gold, CX - 360, CY - 100, nullptr, 1.45f);
            DrawText(TEXT("RATH STARTS AT 32m & ACCELERATES!  MISS AN ASURA = -10m PENALTY!"), Red, CX - 340, CY - 68, nullptr, 1.25f);

            // Weapon Arsenal & Controls
            const float Y0 = CY - 15;
            DrawText(TEXT("DIVINE ASTRAS (SELECT ON THE FLY [1] [2] [3] [4] or [Q]/[E]):"), FLinearColor(0.2f, 0.85f, 1.f), CX - 340, Y0, nullptr, 1.3f);
            DrawText(TEXT("• [1] INDRA'S VAJRA        - High-velocity piercing divine lightning"), FLinearColor(0.2f, 0.85f, 1.0f), CX - 320, Y0 + 26, nullptr, 1.05f);
            DrawText(TEXT("• [2] SHIVA'S TRISHUL      - 3-Prong holy fire spread across lanes"), Orange, CX - 320, Y0 + 50, nullptr, 1.05f);
            DrawText(TEXT("• [3] SUDARSHANA CHAKRA    - Spinning solar disc of destruction"), Gold, CX - 320, Y0 + 74, nullptr, 1.05f);
            DrawText(TEXT("• [4] BRAHMASTRA           - Celestial obliteration shockwave"), Red, CX - 320, Y0 + 98, nullptr, 1.05f);

            DrawText(TEXT("CONTROLS & HAZARDS:"), White, CX - 340, Y0 + 132, nullptr, 1.3f);
            DrawText(TEXT("Steer: [A] / [D]  |  Jump: [SPACE]  |  Auto-Cast: [T]  |  Manual: [F]/[LMB]/[SHIFT]"), White, CX - 320, Y0 + 158, nullptr, 1.1f);
            DrawText(TEXT("Hellfire Fiends = ROARING CHAIN EXPLOSIONS!  Mahishasura Gates = Massive barrier!"), Orange, CX - 320, Y0 + 184, nullptr, 1.1f);

            const float PA = 0.6f + 0.4f * FMath::Sin(Game->Elapsed * 4.f);
            DrawText(TEXT("PRESS [ENTER] TO START THE RUN"), Gold * PA, CX - 210, Y0 + 225, nullptr, 2.0f);
        }
        return;
    }

    // ═══════════════════════════════════════════
    // GAMEPLAY HUD
    // ═══════════════════════════════════════════
    auto* Runner = Cast<ALightRunner>(UGameplayStatics::GetPlayerPawn(this, 0));
    if (!Runner) return;
    const float Dist = Game->ChariotDistance;

    // ── 1. TOP CENTER: CHARIOT DISTANCE GAUGE (THE CORE PROXIMITY METER) ──
    const float GaugeW = 480.f;
    const float GaugeH = 54.f;
    const float GaugeX = CX - GaugeW * 0.5f;
    const float GaugeY = Canvas->SizeX < 1440.f ? 102.f : 14.f;

    const bool bCritical = Dist < 14.f;
    const bool bWarning = Dist >= 14.f && Dist < 25.f;
    const FLinearColor StatusColor = bCritical ? Red : (bWarning ? Amber : Gold);

    DrawRect(FLinearColor(0.02f, 0.02f, 0.05f, 0.92f), GaugeX, GaugeY, GaugeW, GaugeH);
    DrawRect(StatusColor, GaugeX, GaugeY, GaugeW, 2.5f);
    DrawRect(StatusColor, GaugeX, GaugeY + GaugeH - 2.5f, GaugeW, 2.5f);

    // Distance Bar Fill (0m to 70m scale)
    const float BarRatio = FMath::Clamp(Dist / 70.f, 0.f, 1.f);
    const float BarFillW = (GaugeW - 20.f) * BarRatio;
    DrawRect(FLinearColor(0.08f, 0.08f, 0.12f, 0.8f), GaugeX + 10.f, GaugeY + 38.f, GaugeW - 20.f, 8.f);
    DrawRect(StatusColor, GaugeX + 10.f, GaugeY + 38.f, BarFillW, 8.f);

    // Distance Text with Heartbeat effect
    const FString DistStr = FString::Printf(TEXT("CHARIOT: %.1fm BEHIND"), Dist);
    DrawText(DistStr, StatusColor, GaugeX + 18.f, GaugeY + 8.f, nullptr, 1.4f);

    // Status Label
    const TCHAR* StatusTag = bCritical ? TEXT("[! SIREN: CLOSING IN !]") : (bWarning ? TEXT("[GRINDING NEARBY]") : TEXT("[SAFE DISTANCE]"));
    DrawText(StatusTag, StatusColor, GaugeX + GaugeW - 220.f, GaugeY + 9.f, nullptr, 1.05f);

    // ── 2. TOP LEFT: 4-SLOT WEAPON SELECTOR HUD & BELLS ──
    const float WepBoxX = 20.f;
    const float WepBoxY = 14.f;
    const float WepBoxW = 430.f;
    const float WepBoxH = 96.f;
    DrawRect(FLinearColor(0.02f, 0.02f, 0.05f, 0.92f), WepBoxX, WepBoxY, WepBoxW, WepBoxH);
    DrawRect(Gold, WepBoxX, WepBoxY, WepBoxW, 2.f);

    // 4 Slots display:
    const struct { const TCHAR* Key; const TCHAR* Name; EWeaponType Type; FLinearColor Color; } Slots[] = {
        { TEXT("[1]"), TEXT("VAJRA"), EWeaponType::Vajra, FLinearColor(0.2f, 0.85f, 1.0f) },
        { TEXT("[2]"), TEXT("TRISHUL"), EWeaponType::Trishul, Orange },
        { TEXT("[3]"), TEXT("CHAKRA"), EWeaponType::Chakra, Gold },
        { TEXT("[4]"), TEXT("BRAHMA"), EWeaponType::Brahmastra, Red }
    };

    const float SlotW = 96.f;
    const float SlotH = 38.f;
    for (int32 s = 0; s < 4; ++s)
    {
        const float SX = WepBoxX + 10.f + s * (SlotW + 6.f);
        const float SY = WepBoxY + 6.f;
        const bool bActive = (Runner->CurrentWeapon == Slots[s].Type);
        const FLinearColor BG = bActive ? Slots[s].Color * 0.35f : FLinearColor(0.06f, 0.06f, 0.08f, 0.8f);
        const FLinearColor Border = bActive ? Slots[s].Color : FLinearColor(0.3f, 0.3f, 0.35f, 0.6f);

        DrawRect(BG, SX, SY, SlotW, SlotH);
        DrawRect(Border, SX, SY, SlotW, bActive ? 2.f : 1.f);
        DrawRect(Border, SX, SY + SlotH - (bActive ? 2.f : 1.f), SlotW, bActive ? 2.f : 1.f);
        DrawText(Slots[s].Key, bActive ? Gold : White, SX + 4.f, SY + 3.f, nullptr, 0.85f);
        DrawText(Slots[s].Name, bActive ? Slots[s].Color : FLinearColor(0.7f, 0.7f, 0.7f), SX + 4.f, SY + 18.f, nullptr, 0.95f);
    }

    // Auto-Fire & Controls reminder
    const FString AutoStr = Runner->bAutoFire ? TEXT("AUTO-CAST: [ON] [T]") : TEXT("AUTO-CAST: [OFF] [T]");
    const FLinearColor AutoCol = Runner->bAutoFire ? FLinearColor(0.3f, 0.95f, 0.4f) : FLinearColor(0.7f, 0.7f, 0.75f);
    DrawText(AutoStr, AutoCol, WepBoxX + 12.f, WepBoxY + 48.f, nullptr, 0.92f);

    const FString TierStr = FString::Printf(TEXT("TIER %d | Q/E"), Runner->WeaponLevel);
    DrawText(TierStr, FLinearColor(0.9f, 0.9f, 0.9f), WepBoxX + 155.f, WepBoxY + 48.f, nullptr, 0.92f);

    // Active Astra Power Description
    const TCHAR* ActivePower = (Runner->CurrentWeapon == EWeaponType::Vajra) ? TEXT("POWER: PIERCING LIGHTNING (PASSES THROUGH DEMONS)") :
                               (Runner->CurrentWeapon == EWeaponType::Trishul) ? TEXT("POWER: 3-LANE HOLY FIRE (SPREAD VOLLEY ACROSS ROAD)") :
                               (Runner->CurrentWeapon == EWeaponType::Chakra) ? TEXT("POWER: SOLAR SAW DISC (RAPID SLICING ROTATION)") :
                                                                               TEXT("POWER: CATACLYSM SHOCKWAVE (MASSIVE OBLITERATION BLAST)");
    DrawText(ActivePower, Slots[FMath::Clamp(static_cast<int32>(Runner->CurrentWeapon), 0, 3)].Color, WepBoxX + 12.f, WepBoxY + 70.f, nullptr, 0.82f);

    // Sacred Bells Icons
    for (int32 i = 0; i < 3; ++i)
    {
        const bool Active = i < Game->Bells;
        const float BX = WepBoxX + WepBoxW - 84.f + i * 26.f;
        DrawRect(Active ? Gold : FLinearColor(0.2f, 0.2f, 0.2f, 0.5f), BX, WepBoxY + 46.f, 20.f, 20.f);
        if (Active) DrawText(TEXT("B"), FLinearColor::Black, BX + 5.f, WepBoxY + 48.f, nullptr, 0.8f);
    }

    // ── 3. TOP RIGHT: PERFORMANCE STATS ──
    const float StatBoxW = 230.f;
    const float StatBoxH = 68.f;
    const float StatBoxX = Canvas->SizeX - StatBoxW - 24.f;
    const float StatBoxY = 14.f;
    DrawRect(FLinearColor(0.02f, 0.02f, 0.05f, 0.9f), StatBoxX, StatBoxY, StatBoxW, StatBoxH);
    DrawRect(Gold, StatBoxX, StatBoxY, StatBoxW, 2.f);

    DrawText(FString::Printf(TEXT("BANISHED: %d"), Game->ObstaclesBlasted), Gold, StatBoxX + 14.f, StatBoxY + 8.f, nullptr, 1.3f);
    DrawText(FString::Printf(TEXT("SEVA: %d  |  x%d"), Game->Score, Game->Flow), White, StatBoxX + 14.f, StatBoxY + 36.f, nullptr, 1.1f);

    // ── 5. WORLD CLARITY: OVERHEAD ASURA NAMEPLATES & HEALTH BARS ──
    for (ALightProp* Prop : Game->Props)
    {
        if (!IsValid(Prop) || Prop->bCleared) continue;
        const FVector PLoc = Prop->GetActorLocation();
        const float Dx = PLoc.X - Runner->GetActorLocation().X;
        if (Dx < -200.f || Dx > 3400.f) continue;

        const float OverheadZ = (Prop->bGate || Prop->Kind == ETailKind::DemonGate) ? 410.f :
                                (Prop->Kind == ETailKind::Brute) ? 260.f : 170.f;
        const FVector ScreenPos = Canvas->Project(PLoc + FVector(0, 0, OverheadZ));
        if (ScreenPos.Z <= 0.f || ScreenPos.X < -100.f || ScreenPos.X > Canvas->SizeX + 100.f) continue;

        const float BarW = (Prop->bGate || Prop->Kind == ETailKind::DemonGate) ? 140.f :
                           (Prop->Kind == ETailKind::Brute) ? 100.f : 64.f;
        const float BarH = 8.f;
        const float BX = ScreenPos.X - BarW * 0.5f;
        const float BY = ScreenPos.Y;

        // Health background
        DrawRect(FLinearColor(0.02f, 0.02f, 0.05f, 0.85f), BX - 1.f, BY - 1.f, BarW + 2.f, BarH + 2.f);

        const int32 MaxHP = (Prop->bGate || Prop->Kind == ETailKind::DemonGate) ? 6 :
                            (Prop->Kind == ETailKind::Brute) ? 3 : 1;
        const float HPFrac = FMath::Clamp(static_cast<float>(Prop->Health) / MaxHP, 0.f, 1.f);
        const FLinearColor HPCol = Prop->bExplosive ? FLinearColor(1.f, 0.45f, 0.05f) :
                                  (Prop->Kind == ETailKind::Brute) ? FLinearColor(0.95f, 0.15f, 0.15f) :
                                  (Prop->bGate || Prop->Kind == ETailKind::DemonGate) ? FLinearColor(0.85f, 0.1f, 0.9f) : FLinearColor(1.f, 0.2f, 0.2f);
        DrawRect(HPCol, BX, BY, BarW * HPFrac, BarH);

        // Demon tag
        const TCHAR* DTag = Prop->bExplosive ? TEXT("! FIEND [EXPLOSIVE] !") :
                            (Prop->Kind == ETailKind::Brute) ? TEXT("RAKSHASA BRUTE") :
                            (Prop->bGate || Prop->Kind == ETailKind::DemonGate) ? TEXT("MAHISHASURA GATE") : TEXT("ASURA");
        DrawText(DTag, HPCol, BX, BY - 15.f, nullptr, 0.85f);
    }

    // ── 4. SCREEN EDGE RED PULSE WARNING (WHEN CHARIOT IS VERY CLOSE) ──
    if (bCritical)
    {
        const float PulseSpeed = FMath::Lerp(8.f, 18.f, FMath::Clamp((15.f - Dist) / 15.f, 0.f, 1.f));
        const float Alpha = 0.25f + 0.35f * FMath::Abs(FMath::Sin(Game->Elapsed * PulseSpeed));
        const float BorderW = 12.f + 8.f * (1.f - Dist / 15.f);
        const FLinearColor DangerCol(1.f, 0.05f, 0.05f, Alpha);
        DrawRect(DangerCol, 0, 0, Canvas->SizeX, BorderW);
        DrawRect(DangerCol, 0, Canvas->SizeY - BorderW, Canvas->SizeX, BorderW);
        DrawRect(DangerCol, 0, 0, BorderW, Canvas->SizeY);
        DrawRect(DangerCol, Canvas->SizeX - BorderW, 0, BorderW, Canvas->SizeY);
    }

    // ── 5. BOTTOM TEMPLE PROCESSION BAR ──
    const float BarW = Canvas->SizeX * 0.55f;
    const float BarX = (Canvas->SizeX - BarW) * 0.5f;
    const float BarY = Canvas->SizeY - 28.f;
    DrawRect(FLinearColor(0.03f, 0.03f, 0.06f, 0.85f), BarX, BarY, BarW, 10);
    DrawRect(Gold * 0.5f, BarX, BarY, BarW, 1);
    const float MooshakPos = FMath::Clamp(Runner->GetActorLocation().X / Game->FinishX, 0.f, 1.f);
    const float RathPos = FMath::Clamp(Game->ProcessionX / Game->FinishX, 0.f, 1.f);
    DrawRect(Gold, BarX + BarW * MooshakPos - 4, BarY - 4, 8, 18);
    DrawRect(Red, BarX + BarW * RathPos - 5, BarY - 5, 10, 20);

    // ── 6. CENTER NOTIFICATION BARKS ──
    if (Game->Elapsed < Game->CueUntil && !Game->Cue.IsEmpty())
    {
        float CueW = 0.f, CueH = 0.f;
        GetTextSize(Game->Cue, CueW, CueH, nullptr, 1.7f);
        const float CueScale = 1.7f * FMath::Min(1.f, (Canvas->SizeX - 60.f) / FMath::Max(1.f, CueW));
        GetTextSize(Game->Cue, CueW, CueH, nullptr, CueScale);
        const FLinearColor BarkCol = Game->Cue.Contains(TEXT("MISSED")) ? Red :
                                     Game->Cue.Contains(TEXT("UPGRADE")) ? FLinearColor(0.2f, 0.85f, 1.f) : Gold;
        DrawRect(FLinearColor(0.02f, 0.02f, 0.04f, 0.88f), CX - CueW * 0.5f - 15, CY + 70, CueW + 30, 42);
        DrawRect(BarkCol, CX - CueW * 0.5f - 15, CY + 70, CueW + 30, 2);
        DrawText(Game->Cue, BarkCol, CX - CueW * 0.5f, CY + 78, nullptr, CueScale);
    }

    if (Game->bPaused)
    {
        DrawRect(FLinearColor(0.02f, 0.02f, 0.04f, 0.75f), 0, 0, Canvas->SizeX, Canvas->SizeY);
        DrawText(TEXT("PAUSED"), Gold, CX - 70, CY - 40, nullptr, 2.8f);
        DrawText(TEXT("PRESS [ESC] OR [P] TO RESUME"), White, CX - 160, CY + 20, nullptr, 1.4f);
    }
}
