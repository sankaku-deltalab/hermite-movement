type Vector = number[];

export = cubicHermite;

declare let cubicHermite: (<V extends Vector>(
  p0: V,
  v0: V,
  p1: V,
  v1: V,
  t: number,
  f?: V
) => V) & {
  derivative: <V extends Vector>(
    p0: V,
    v0: V,
    p1: V,
    v1: V,
    t: number,
    f?: V
  ) => V;
};
