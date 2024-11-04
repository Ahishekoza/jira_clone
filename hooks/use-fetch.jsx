// In each api call , we have to deal with various fields such as / data / error  and loading . which is common in every api call
// so thats why we need to take the help of custom hooks to avoid managing same fields in different components

import { useState } from "react";
import { toast } from "sonner";

export const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (error) {
      setError(error);
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn };
};
