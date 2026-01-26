// Setup file that runs after mocks are initialized
// This is where we can set up globals that mocks might need

// Ensure NativeWind's CSS interop global exists if needed
if (typeof global !== 'undefined' && !global._ReactNativeCSSInterop) {
  global._ReactNativeCSSInterop = {
    cssInterop: (component: any) => component,
  };
}
