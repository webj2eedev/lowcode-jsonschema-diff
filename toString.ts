import fs from "fs"

import cabina from "./cabina"
import cabinb from "./cabinb"

const a = JSON.stringify(cabina);
const b = JSON.stringify(cabinb);

fs.writeFileSync("d:/a.txt", a);
fs.writeFileSync("d:/b.txt", b);

