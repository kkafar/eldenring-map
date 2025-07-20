// API schemas. These are separate from DB schemas.

import { z } from "zod";

export const UserSchema = z.object({
  name: z.string().nonempty(),
});

