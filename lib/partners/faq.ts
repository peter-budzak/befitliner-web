import type { PartnerCopy } from "./copy";
export function getPartnerFaq(copy: PartnerCopy) {
  const t = (key: keyof PartnerCopy) => copy[key];
  return [
    [
      t("Who is this partnership for?"),
      t(
        "Entrepreneurs and sales professionals who know the fitness sector, can approach gym owners and want to develop their market systematically. Existing relationships can help; experience and plans are assessed individually.",
      ),
    ],
    [
      t("How is my share calculated?"),
      t(
        "From agreed net distributable revenue, not automatically from total sales. Applicable direct costs are deducted from the €297 one-off price before splitting. A 1% + 1% split of the 2% platform fee is illustrative and depends on costs and the agreement.",
      ),
    ],
    [
      t("Is an upfront investment required?"),
      t(
        "Financial terms, local sales costs and any installation costs need to be agreed individually. This page does not promise a cost-free partnership; the calculator excludes some operating costs and taxes.",
      ),
    ],
    [
      t("When can I receive exclusivity?"),
      t(
        "The first 90 days are non-exclusive. After acquiring 10 activated paying gyms and meeting the agreed criteria, you may qualify for 12 months of exclusivity. It is neither automatic nor lifelong.",
      ),
    ],
    [
      t("Are annual targets already binding?"),
      t(
        "Targets shown as unapproved are proposals. The final target, renewal terms and definition of an activated gym are set in the agreement for each country.",
      ),
    ],
    [
      t("What happens after I apply?"),
      t(
        "We review your experience and selected country and contact you about next steps. Applying does not create a contract, grant exclusivity or commit you to starting the partnership.",
      ),
    ],
  ];
}
