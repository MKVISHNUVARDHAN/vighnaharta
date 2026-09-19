using UnrealBuildTool;
using System.Collections.Generic;
public class PathOfLightTarget : TargetRules
{
    public PathOfLightTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Game;
        DefaultBuildSettings = BuildSettingsVersion.Latest;
        IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
        ExtraModuleNames.Add("PathOfLight");
    }
}
