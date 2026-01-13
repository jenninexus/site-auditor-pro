import { getDefaultConfig } from "expo/metro-config";
import { withNativeWind } from "nativewind/metro";

const config = getDefaultConfig(process.cwd());

export default withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
  forceWriteFileSystem: true,
});
