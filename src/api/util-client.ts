"use client";

import axios from "axios";
import type z from "zod";
import { APIClient } from "../utils/api-client";
import type { APIContract } from "./contract";

type APIEndpoints = {
  [Key in keyof typeof APIContract]: {
    Request: z.infer<(typeof APIContract)[Key]["request"]>;
    Response: z.infer<(typeof APIContract)[Key]["response"]>;
  };
};

export const client = new APIClient<APIEndpoints>(
  axios.create({
    baseURL: "/api",
  }),
);
