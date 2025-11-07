import {
    IconBrandX,
    IconProgressDown,
  } from "@tabler/icons-react";
  import Image from "next/image";
  import Link from "next/link";
import { GithubStars } from "./github-stars";
  
  export function BuiltBy() {
    return (
      <div className="flex flex-col items-center justify-center mt-12 mb-12">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <IconProgressDown className="size-3" />
          Data is updated hourly.
        </span>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          Built by{" "}
          <Link
            href="https://x.com/bidew_io"
            className="flex items-center gap-1"
          >
            <Image
              src="https://pbs.twimg.com/profile_images/1918356199017197568/U5UTvDkk_400x400.jpg"
              alt="bidew_io"
              width={20}
              height={20}
              className="rounded-full"
            />
            <span className="font-semibold hover:underline hover:underline-offset-4">
              @bidew_io
            </span>
          </Link>
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Link
            href="https://x.com/bidew_io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded bg-gray-100 hover:bg-gray-200 px-3 py-1 text-sm font-medium text-gray-800 transition"
            title="Follow me on X"
          >
            <IconBrandX className="size-3" />
            <span className="flex items-center gap-1 text-muted-foreground">
              Follow me
            </span>
          </Link>
          <GithubStars />
          {/* <Link
            href="https://opdashboard.bidewio.tech/share/overview/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded bg-gray-100 hover:bg-gray-200 px-3 py-1 text-sm font-medium text-gray-800 transition"
            title="Analytics"
          >
            <IconChartBar className="size-3" />
            <span className="flex items-center gap-1 text-muted-foreground">
              Analytics
            </span>
          </Link> */}
        </div>
      </div>
    );
  }