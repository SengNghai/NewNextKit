"use client";

import { useDomainCheck } from "~/hooks/useDomainCheck";

export default function Page() {
  const domainStatus = useDomainCheck("baidu.com");

  return (
    <div>
      {domainStatus.isBlocked ? (
        <p>⚠️ 该域名可能已被监管屏蔽</p>
      ) : (
        <p>✅ 该域名可正常访问</p>
      )}

      <pre>{JSON.stringify(domainStatus, null, 2)}</pre>
    </div>
  );
}
