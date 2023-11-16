class MyersDiff<T, E> {
  equals: (ele_a: T, ele_b: T) => boolean;
  str: (ele: T) => E;

  constructor(equals: (ele_a: T, ele_b: T) => boolean, str: (ele: T) => E) {
    this.equals = equals;
    this.str = str;
  }

  private getX(v: number[], k: number) {
    if (k < 0) {
      return v[v.length + k];
    } else {
      return v[k];
    }
  }

  private setX(v: number[], k: number, x: number) {
    if (k < 0) {
      v[v.length + k] = x;
    } else {
      v[k] = x;
    }
  }

  private shortest_edit(
    a: Array<T>,
    b: Array<T>
  ): [number, number, Array<number[]>] {
    const N = a.length;
    const M = b.length;

    const MAX = N + M;

    const v: number[] = new Array(2 * MAX + 1).fill(-1);
    const vHis: Array<number[]> = [];

    v[1] = 0;
    for (let d = 0; d <= MAX; d++) {
      vHis.push([...v]);

      for (let k = -d; k <= d; k = k + 2) {
        let x, y;
        if (k == -d || (k != d && this.getX(v, k - 1) < this.getX(v, k + 1))) {
          x = this.getX(v, k + 1);
        } else {
          x = this.getX(v, k - 1) + 1;
        }

        y = x - k;

        while (x < N && y < M && this.equals(a[x], b[y])) {
          x++;
          y++;
        }

        this.setX(v, k, x);

        if (x >= N && y >= M) {
          return [d, k, vHis];
        }
      }
    }

    throw new Error("(d, k) not found!");
  }

  private backTrack(
    a: Array<T>,
    b: Array<T>,
    d: number,
    k: number,
    vHis: Array<number[]>
  ) {
    const trace: Array<[[number, number], [number, number]]> = [];

    // 起点是终点（N, M）
    let x = a.length;
    let y = b.length;

    vHis.reverse().forEach((v) => {
      const k = x - y;

      let prev_k;
      if (k == -d || (k != d && this.getX(v, k - 1) < this.getX(v, k + 1))) {
        prev_k = k + 1;
      } else {
        prev_k = k - 1;
      }

      const prev_x = this.getX(v, prev_k);
      const prev_y = prev_x - prev_k;

      while (x > prev_x && y > prev_y) {
        trace.push([
          [x - 1, y - 1],
          [x, y],
        ]);

        x = x - 1;
        y = y - 1;
      }

      if (d > 0) {
        trace.push([
          [prev_x, prev_y],
          [x, y],
        ]);
      }

      d--;
      x = prev_x;
      y = prev_y;
    });

    return trace;
  }

  private makeDiff(
    trace: Array<[[number, number], [number, number]]>,
    a: Array<T>,
    b: Array<T>
  ) {
    const diff: Array<
      {
        type: "insert" | "delete" | "equal";
      } & E
    > = [];

    trace.forEach((t) => {
      const prev_x = t[0][0];
      const prev_y = t[0][1];
      const x = t[1][0];
      const y = t[1][1];

      const a_ele = a[prev_x];
      const b_ele = b[prev_y];

      if (x == prev_x) {
        diff.unshift({
          type: "insert",
          ...this.str(b_ele),
        });
      } else if (y == prev_y) {
        diff.unshift({
          type: "delete",
          ...this.str(a_ele),
        });
      } else {
        diff.unshift({
          type: "equal",
          ...this.str(a_ele),
        });
      }
    });

    return diff;
  }

  diff(a: Array<T>, b: Array<T>) {
    const [d, k, vHis] = this.shortest_edit(a, b);

    const trace = this.backTrack(a, b, d, k, vHis);

    const diff = this.makeDiff(trace, a, b);

    return diff;
  }
}

import cabina from "./cabina";
import a from "./cabina";
import cabinb from "./cabinb";
import b from "./cabinb";

// const a = "ABCABBA".split("");
// const b = "CBABAC".split("");

const myers = new MyersDiff<CabinJElement, { id: string }>(
  (ele_a, ele_b) => {
    return ele_a.id === ele_b.id;
  },
  (ele) => {
    return {
      id: ele.id,
    };
  }
);

function diffCabinJElements(
  srcEles: Array<CabinJElement>,
  dstEles: Array<CabinJElement>
) {
  const diff = myers.diff(srcEles, dstEles);
  return diff;
}

interface CabinJ {
  pagejson: {
    id: string;
    children: Array<CabinJElement>;
  };
}

interface CabinJElement {
  id: string;
  children?: Array<CabinJElement>;
}

function diffCabinJ(srcCabinJ: CabinJ, dstCabinJ: CabinJ) {
  if (!srcCabinJ.pagejson) {
    throw new Error("srcCabinJ结构不对，不包含pagejson。");
  }
  if (!dstCabinJ.pagejson) {
    throw new Error("dstCabinJ结构不对，不包含pagejson。");
  }

  const diff = diffCabinJElements(a.pagejson.children, b.pagejson.children);
  console.log(diff);
}

diffCabinJ(cabina, cabinb);

// console.log(JSON.stringify(diff, null, 4));

// const a = "ABCABBA".split("");
// const b = "CBABAC".split("");

// const myers = new MyersDiff<string>((ele_a, ele_b) => {
//   return ele_a === ele_b;
// });
// const diff = myers.diff(a, b);

// console.log(a, "-->", b, "-->", diff);
