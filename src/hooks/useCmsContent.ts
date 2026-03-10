import { useEffect, useState } from "react";

export function useCmsContent<T>(section: string, fallback: T): T {
  const [content, setContent] = useState<T>(fallback);

  useEffect(() => {
    fetch(`/api/content?section=${section}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setContent(data.data);
        }
      })
      .catch(() => {});
  }, [section]);

  return content;
}
