import { Fragment } from "react";

type Part = React.ReactNode;

/**
 * The business address as one line, from its optional parts:
 * "Adelaide, South Australia", or "12 King St, Adelaide, SA 5000" when a
 * street and postcode are set. Parts may be editable text in the visual editor.
 */
export function AddressText({
  address,
}: {
  address: { street?: Part | null; locality: Part; region: Part; postcode?: Part | null };
}) {
  const regionLine = address.postcode ? (
    <>
      {address.region} {address.postcode}
    </>
  ) : (
    address.region
  );
  const parts = [address.street, address.locality, regionLine].filter(Boolean);
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && ", "}
          {part}
        </Fragment>
      ))}
    </>
  );
}
