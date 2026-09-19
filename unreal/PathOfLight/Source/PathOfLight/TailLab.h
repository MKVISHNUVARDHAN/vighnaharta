#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "GameFramework/GameModeBase.h"
#include "GameFramework/HUD.h"
#include "GameFramework/SaveGame.h"
#include "TailLab.generated.h"

class UStaticMeshComponent;
class UPointLightComponent;
class USpringArmComponent;
class UCameraComponent;
class UAudioComponent;
class UNiagaraSystem;
class ADirectionalLight;
class AExponentialHeightFog;
class APointLight;
class ALightRunner;
class ALightProp;
class ALightRath;
class ALightModak;
class ALightMagicBolt;
class ALightPowerUp;

UENUM(BlueprintType)
enum class ETailKind : uint8 { Minion, Fiend, Brute, DemonGate, SacredShrine, Light, Lever, Anchor, Cart };

UENUM(BlueprintType)
enum class EFeelPhase : uint8 { Control, Chaos, Release };

UENUM(BlueprintType)
enum class EWeaponType : uint8 { Vajra = 0, Trishul = 1, Chakra = 2, Brahmastra = 3 };

UENUM(BlueprintType)
enum class EPowerUpType : uint8 { WeaponVajra = 0, WeaponTrishul = 1, WeaponChakra = 2, SacredBell = 3, Modak = 4 };

struct PATHOFLIGHT_API FGameAssets
{
    static bool bLoaded;
    static UStaticMesh* Mooshak;
    static UStaticMesh* RoadStraight;
    static UStaticMesh* AstraVajra;
    static UStaticMesh* AstraTrident;
    static UStaticMesh* AstraChakra;
    static UStaticMesh* GunAK47;
    static UStaticMesh* GunFlamethrower;
    static UStaticMesh* GunRocketLauncher;
    static UStaticMesh* GunShotgun;
    static UStaticMesh* AsuraMinion;
    static UStaticMesh* AsuraBrute;
    static UStaticMesh* AsuraFiend;
    static UStaticMesh* AsuraGate;
    static UStaticMesh* Rath;
    static UStaticMesh* Ganesha;
    static UStaticMesh* DropShadowMesh;
    static UMaterialInterface* SolidMat;
    static UMaterialInterface* RoadMat;

    static void EnsureLoaded();
};

UCLASS()
class PATHOFLIGHT_API ALightSpark : public AActor
{
    GENERATED_BODY()
public:
    ALightSpark();
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Mesh;
    FVector Vel = FVector::ZeroVector;
    float Life = 0, MaxLife = 1;
    void Launch(FVector Pos, FVector Velocity, FLinearColor Color, float Seconds);
    virtual void Tick(float Delta) override;
};

UCLASS()
class PATHOFLIGHT_API ALightMagicBolt : public AActor
{
    GENERATED_BODY()
public:
    ALightMagicBolt();
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Mesh;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UPointLightComponent> Light;
    FVector Velocity = FVector::ZeroVector;
    EWeaponType WeaponType = EWeaponType::Vajra;
    int32 Tier = 1;
    int32 PierceLeft = 1;
    float Life = 0.f;
    float MaxLife = 1.2f;
    float BlastRadius = 0.f;
    float SpinAngle = 0.f;
    bool bActive = false;
    void Launch(FVector StartPos, FVector Dir, EWeaponType InWeapon, int32 InTier);
    void Deactivate();
    virtual void Tick(float Delta) override;
};

UCLASS()
class PATHOFLIGHT_API ALightPowerUp : public AActor
{
    GENERATED_BODY()
public:
    ALightPowerUp();
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Mesh;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Ring;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UPointLightComponent> Light;
    EPowerUpType Type = EPowerUpType::WeaponVajra;
    bool bCollected = false;
    FVector BasePos = FVector::ZeroVector;
    float BobPhase = 0.f;
    void Configure(EPowerUpType InType, FVector Pos);
    virtual void Tick(float Delta) override;
};

UCLASS()
class PATHOFLIGHT_API ALightProp : public AActor
{
    GENERATED_BODY()
public:
    ALightProp();
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Mesh;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> ExtraA;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> ExtraB;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> WheelFL;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> WheelFR;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> WheelBL;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> WheelBR;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UPointLightComponent> EyeGlow;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) ETailKind Kind = ETailKind::Minion;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bGate = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bHurdle = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bExplosive = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Health = 1;
    UPROPERTY(BlueprintReadOnly) float HitFlash = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float MoveSpeed = 0.f;
    UPROPERTY(BlueprintReadOnly) bool bCleared = false;
    UPROPERTY(BlueprintReadOnly) bool bMissed = false;
    UPROPERTY() TObjectPtr<AActor> FloorStrip;
    bool bScored = false;
    FVector Home = FVector::ZeroVector;
    float Spin = 0;
    void Configure(ETailKind Type, FVector Position, FVector Scale, bool Gate = false, bool Explosive = false, float Speed = 0.f);
    void Clear();
    void Explode();
    void TakeMagicDamage(int32 Damage, ALightRunner* Shooter);
    virtual void Tick(float Delta) override;
};

UCLASS()
class PATHOFLIGHT_API ALightModak : public AActor
{
    GENERATED_BODY()
public:
    ALightModak();
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Mesh;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Ring;
    bool bCollected = false;
    FVector BasePos = FVector::ZeroVector;
    float BobPhase = 0;
    void Configure(FVector Position);
    virtual void Tick(float Delta) override;
};

UCLASS()
class PATHOFLIGHT_API ALightCitizen : public AActor
{
    GENERATED_BODY()
public:
    ALightCitizen();
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Body;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Head;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> ArmL;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> ArmR;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Skirt;
    FVector Home = FVector::ZeroVector;
    float Bob = 0;
    float Dash = 0;
    void Configure(FVector Position, FLinearColor Cloth);
    virtual void Tick(float Delta) override;
};

UCLASS()
class PATHOFLIGHT_API ALightRath : public AActor
{
    GENERATED_BODY()
public:
    ALightRath();
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Deck;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Canopy;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Idol;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> EarL;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> EarR;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Trunk;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> WheelL;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> WheelR;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> LampL;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> LampR;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UPointLightComponent> AuraLight;
    float Spin = 0;
    void InitRath();
    void Drive(float X, float Panic, float Delta);
};

UCLASS()
class PATHOFLIGHT_API ALightRunner : public ACharacter
{
    GENERATED_BODY()
public:
    ALightRunner();
    virtual void Tick(float Delta) override;
    virtual void SetupPlayerInputComponent(UInputComponent* Input) override;
    virtual void Landed(const FHitResult& Hit) override;
    UPROPERTY(VisibleAnywhere) TObjectPtr<USpringArmComponent> Boom;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UCameraComponent> Camera;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> TetherVisual;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> DropShadow;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Body;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Head;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> EarL;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> EarR;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Snout;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> Scarf;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> TailA;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> TailB;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> HeroMesh;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> WeaponMesh;
    UPROPERTY(BlueprintReadOnly) TObjectPtr<ALightProp> Target;
    UPROPERTY(BlueprintReadOnly) TObjectPtr<ALightProp> Attached;
    UPROPERTY(BlueprintReadOnly) float Momentum = 900;
    UPROPERTY(BlueprintReadOnly) EWeaponType CurrentWeapon = EWeaponType::Vajra;
    UPROPERTY(BlueprintReadOnly) int32 WeaponLevel = 1;
    UPROPERTY(BlueprintReadOnly) float FireCooldown = 0.f;
    UPROPERTY(BlueprintReadOnly) bool bAutoFire = true;
    float FOVKick = 0;
    float Trauma = 0;
    float JumpSquash = 0;
    FVector LastVelocity = FVector::ZeroVector;
    bool bAirborne = false;
    float GetHoldTime() const { return HoldTime; }
    void CancelTail();
    void FireMagic();
    UFUNCTION(BlueprintCallable) void ToggleAutoFire();
    UFUNCTION(BlueprintCallable) void SelectWeapon(EWeaponType NewType);
    UFUNCTION(BlueprintCallable) void NextWeapon();
    UFUNCTION(BlueprintCallable) void PrevWeapon();
    void SelectSlot1();
    void SelectSlot2();
    void SelectSlot3();
    void SelectSlot4();
    UFUNCTION(BlueprintCallable) void SetSteer(float Value);
    UFUNCTION(BlueprintCallable) void SetPace(float Value);
    UFUNCTION(BlueprintCallable) void PressJump();
    UFUNCTION(BlueprintCallable) void ReleaseJump();
    UFUNCTION(BlueprintCallable) void PressTail();
    UFUNCTION(BlueprintCallable) void ReleaseTail();
    UFUNCTION(BlueprintCallable) void PressAttack();
    void BeginRun();
    void Retry();
    void PauseRun();
private:
    float Steering = 0, Pace = 0, RopeLength = 0, HoldTime = 0;
    float Coyote = 0, JumpBuffer = 0, Clutch = 0, CollisionCooldown = 0, Wag = 0;
    float AttackTime = 0, FacingYaw = 0;
    bool bJumpHeld = false, bTailHeld = false, bWasGrounded = true;
    FVector Recovery = FVector(100, 0, 90);
};

UCLASS()
class PATHOFLIGHT_API ULightSave : public USaveGame
{
    GENERATED_BODY()
public:
    UPROPERTY() int32 Best = 0;
};

UCLASS()
class PATHOFLIGHT_API ALightGameMode : public AGameModeBase
{
    GENERATED_BODY()
public:
    ALightGameMode();
    virtual void BeginPlay() override;
    virtual void Tick(float Delta) override;
    UPROPERTY(BlueprintReadOnly) TArray<TObjectPtr<ALightProp>> Props;
    UPROPERTY(BlueprintReadOnly) TArray<TObjectPtr<ALightCitizen>> Citizens;
    UPROPERTY() TArray<TObjectPtr<ALightSpark>> Sparks;
    UPROPERTY() TArray<TObjectPtr<ALightMagicBolt>> Bolts;
    UPROPERTY() TArray<TObjectPtr<ALightPowerUp>> PowerUps;
    UPROPERTY() TArray<TObjectPtr<AActor>> PathMarks;
    UPROPERTY() TArray<TObjectPtr<APointLight>> Lamps;
    UPROPERTY() TObjectPtr<ALightRath> Procession;
    UPROPERTY() TObjectPtr<ADirectionalLight> Sun;
    UPROPERTY() TObjectPtr<AExponentialHeightFog> Fog;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UAudioComponent> Music;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UAudioComponent> CrowdBed;
    UPROPERTY() TObjectPtr<UNiagaraSystem> FXBurst;
    UPROPERTY() TObjectPtr<UNiagaraSystem> FXBoom;
    UPROPERTY() TObjectPtr<UNiagaraSystem> FXFountain;
    UPROPERTY() TObjectPtr<UNiagaraSystem> FXTrail;
    UPROPERTY(BlueprintReadOnly) int32 Bells = 3;
    UPROPERTY(BlueprintReadOnly) int32 Score = 0;
    UPROPERTY(BlueprintReadOnly) int32 Flow = 1;
    UPROPERTY(BlueprintReadOnly) float ChariotDistance = 32.f;
    UPROPERTY(BlueprintReadOnly) int32 ObstaclesBlasted = 0;
    UPROPERTY(BlueprintReadOnly) int32 MissedObstacles = 0;
    int32 Chain = 0, MaxFlow = 1, Perfects = 0, Saves = 0, Best = 0;
    int32 PhysicsChains = 0, Secrets = 0, Intensity = 0, PathIndex = 0, SparkIndex = 0;
    float ProcessionX = -2400, Elapsed = 0, FlowExpiry = 0, Surge = 0;
    float ProcessionPause = 0, CameraPunch = 0, Shake = 0, PhaseLeft = 14.f, IntroLeft = 0;
    float GrindCooldown = 0.f, AlarmCooldown = 0.f;
    EFeelPhase Phase = EFeelPhase::Control;
    const float FinishX = 108000;
    bool bRunning = false, bFinished = false, bWon = false, bPaused = false, bChaosDrop = false, bCrowdDash = false;
    FString Cue;
    float CueUntil = 0;
    TSet<int32> FoundSecrets;
    FTimerHandle SlowMoTimer;
    float VignetteKick = 0;
    bool bTutYank = false;
    bool bTutSwing = false;
    bool bTutCart = false;
    bool bTutGate = false;

    UFUNCTION(BlueprintCallable) void StartRun();
    UFUNCTION(BlueprintCallable) void Award(int32 Points, const FString& Message);
    void Stumble();
    void Finish(bool Won);
    void TriggerChain(ALightProp* Source);
    void MarkPath(const FVector& At);
    void TickDirector(float Delta, ALightRunner* Runner);
    void ApplyLook(float PlayerX);
    void Juice(float Punch, int32 Petals, FVector At, FLinearColor Color);
    void PlayCue(const TCHAR* SoftPath, float Vol = 1.f);
    void PlayFX(UNiagaraSystem* System, FVector At, float Scale = 1.f);
    void Burst(int32 Count, FVector At, FLinearColor Color, float Up);
    UFUNCTION() void RestoreTime();
    float GapMeters(const ALightRunner* Runner) const;
};

UCLASS()
class PATHOFLIGHT_API ALightHUD : public AHUD
{
    GENERATED_BODY()
public:
    virtual void DrawHUD() override;
};
