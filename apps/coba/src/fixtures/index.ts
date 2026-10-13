import type { PreviewResponse } from "../types";
import kopi from "./kopi-senja";
import studio from "./studio-nara";
import minim from "./minim";
import tanya from "./tanya";
import acara from "./acara";
export const fixtures: Record<string, PreviewResponse> = { demo: kopi, jasa: studio, minim, tanya, acara };
