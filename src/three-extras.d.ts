import "three/examples/jsm/math/MeshSurfaceSampler.js";

// Present in Three r187; the corresponding @types example declaration lags behind.
declare module "three/examples/jsm/math/MeshSurfaceSampler.js" {
  interface MeshSurfaceSampler {
    setRandomGenerator(randomFunction: () => number): this;
  }
}
