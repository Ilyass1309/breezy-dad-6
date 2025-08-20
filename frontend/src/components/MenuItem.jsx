import Link from "next/link";
import clsx from "clsx";
export default function MenuItem({
  label,
  href,
  icon,
  iconFillable = false,
  pathname,
  showOnDesktop = true,
  showOnMobile = true,
  customClass = "",
}) {
  // Determine visibility classes for desktop and mobile
  let visibilityClass = "w-full " + customClass;
  if (!showOnMobile && showOnDesktop) {
    visibilityClass += " hidden sm:list-item";
  } else if (showOnMobile && !showOnDesktop) {
    visibilityClass += " list-item sm:hidden";
  } else if (!showOnMobile && !showOnDesktop) {
    visibilityClass += " hidden";
  } else {
    visibilityClass += " list-item";
  }

  return (
    <li className={visibilityClass}>
      <Link href={href} className="w-full btn btn-text justify-start">
        <span
          className={clsx(
            "size-6 text-base-content/80",
            pathname == href
              ? `text-primary icon-[tabler--${icon}${
                  iconFillable ? "-filled" : ""
                }]`
              : `icon-[tabler--${icon}]`
          )}
        />
        <span
          className={clsx(
            pathname == href
              ? `text-primary font-semibold`
              : "text-base-content/80 font-normal"
          )}
        >
          {label}
        </span>
      </Link>
    </li>
  );
}
