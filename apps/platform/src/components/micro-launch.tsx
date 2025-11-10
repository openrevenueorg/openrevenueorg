import Link from "next/link";

export function MicroLaunch() {
  return (
    <Link
      href="https://www.microlaunch.net/openrevenueorg?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-openrevenue"
      target="_blank"
    >
      <img
        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1035633&theme=neutral&t=1762534508709"
        alt="OpenRevenue - Transparent&#0032;revenue&#0032;verification&#0032;for&#0032;startups | Product Hunt"
        style={{ width: "250px", height: "54px" }}
        width="250"
        height="54"
      />
    </Link>
  );
}