using UnrealBuildTool;
public class PathOfLight : ModuleRules
{
    public PathOfLight(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
        PublicDependencyModuleNames.AddRange(new[] { "Core", "CoreUObject", "Engine", "InputCore", "Niagara" });
    }
}
