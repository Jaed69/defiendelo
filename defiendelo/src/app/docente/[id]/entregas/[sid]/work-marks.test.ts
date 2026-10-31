import { describe, expect, it } from "vitest";
import { markWork } from "./work-marks";

describe("markWork", () => {
  const work = "Don Santos representa la pobreza. El título es una metáfora de los niños. Fin.";

  it("marks every quote found in the work, in reading order", () => {
    expect(
      markWork(work, [
        { quote: "«El título es una metáfora de los niños»", label: "2" },
        { quote: "don santos representa la pobreza", label: "1" },
      ]),
    ).toEqual([
      { text: "Don Santos representa la pobreza", label: "1" },
      { text: ". " },
      { text: "El título es una metáfora de los niños", label: "2" },
      { text: ". Fin." },
    ]);
  });

  it("leaves the work whole when no quote is in it", () => {
    expect(markWork(work, [{ quote: "algo que nunca escribió", label: "1" }])).toEqual([{ text: work }]);
  });

  it("ignores very short and overlapping quotes", () => {
    expect(
      markWork(work, [
        { quote: "Fin", label: "1" },
        { quote: "representa la pobreza", label: "2" },
        { quote: "Santos representa", label: "3" },
      ]),
    ).toEqual([{ text: "Don Santos " }, { text: "representa la pobreza", label: "2" }, { text: ". El título es una metáfora de los niños. Fin." }]);
  });

  it("drops a trailing ellipsis from a quote", () => {
    expect(markWork("Uno dos tres cuatro cinco.", [{ quote: "dos tres cuatro…", label: "1" }])).toEqual([
      { text: "Uno " },
      { text: "dos tres cuatro", label: "1" },
      { text: " cinco." },
    ]);
  });
});
