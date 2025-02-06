import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

queryClient.invalidateQueries({ queryKey: ["news"] });
