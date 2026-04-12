"use client";

import { useEffect } from "react";

const GA_MEASUREMENT_ID = "G-WP52LB76KQ";

export function GoogleAnalytics() {
  useEffect(() => {
    if (document.getElementById("ga-gtag-js")) {
      return;
    }

    const external = document.createElement("script");
    external.id = "ga-gtag-js";
    external.async = true;
    external.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(external);

    const inline = document.createElement("script");
    inline.id = "ga-gtag-inline";
    inline.text = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');
`;
    document.head.appendChild(inline);
  }, []);

  return null;
}
