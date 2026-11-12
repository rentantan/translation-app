import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

// react-router v7 は TextEncoder を使うが、CRA の jsdom には無いので補う
Object.assign(global, { TextEncoder, TextDecoder });
