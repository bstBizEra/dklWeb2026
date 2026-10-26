// Lao overrides for src/lib/data/routes.ts (page names used in breadcrumbs, footer, 404 links and
// "Related solutions"). Keyed by route id. Only label, navLabel and blurb are translated; ids and hrefs stay.
import type { SiteRoute } from "@/lib/data/routes";

export const loRoutes: Partial<Record<string, Partial<Pick<SiteRoute, "label" | "navLabel" | "blurb">>>> = {
  home: { label: "ໜ້າຫຼັກ", blurb: "ໜ້າຫຼັກຂອງ DK LAO." },
  about: { label: "ກ່ຽວກັບ DK LAO", navLabel: "ກ່ຽວກັບ DK LAO", blurb: "ພວກເຮົາແມ່ນໃຜ ແລະ ສະໜັບສະໜູນຫຍັງແດ່." },
  rental: { label: "ເຊົ່າລົດຍົກ", navLabel: "ການເຊົ່າ", blurb: "ເຊົ່າລົດຍົກໄລຍະສັ້ນ ແລະ ໄລຍະຍາວ." },
  "rental-short": { label: "ເຊົ່າໄລຍະສັ້ນ", blurb: "ລົດຍົກສຳລັບໂຄງການ ແລະ ຊ່ວງວຽກຫຼາຍ." },
  "rental-long": { label: "ເຊົ່າໄລຍະຍາວ", blurb: "ລົດຍົກສຳລັບການດຳເນີນງານປະຈຳ." },
  sales: { label: "ລົດຍົກຂາຍ", navLabel: "ລົດຍົກ", blurb: "ລົດຍົກໃໝ່ ແລະ ໃຊ້ແລ້ວ ສຳລັບໜ້າວຽກຂອງທ່ານ." },
  "sales-new": { label: "ລົດຍົກໃໝ່", blurb: "ປຽບທຽບລົດຍົກໃໝ່." },
  "sales-used": { label: "ລົດຍົກໃຊ້ແລ້ວ", blurb: "ລົດຍົກໃຊ້ແລ້ວທີ່ຄັດເລືອກ ພ້ອມການກວດສະພາບ." },
  parts: { label: "ອາໄຫຼ່", navLabel: "ອາໄຫຼ່", blurb: "ອາໄຫຼ່ທີ່ກົງກັບລຸ້ນ ແລະ ເລກຈັກ." },
  maintenance: { label: "ບໍລິການບຳລຸງຮັກສາ", navLabel: "ບໍລິການ", blurb: "ບຳລຸງຮັກສາຕາມກຳນົດ ແລະ ຊ່ອມແປງ." },
  batteries: { label: "ແບັດເຕີຣີ ແລະ ເຄື່ອງສາກ", blurb: "ພະລັງງານສຳລັບລົດຍົກໄຟຟ້າ." },
  warehouse: { label: "ອຸປະກອນສາງ", blurb: "ຊັ້ນວາງ, ອຸປະກອນຂົນຍ້າຍ ແລະ ການສຳຫຼວດສະຖານທີ່." },
  material: { label: "ອຸປະກອນຂົນຍ້າຍວັດສະດຸ", blurb: "ອຸປະກອນສຳລັບຍົກ, ຍ້າຍ ແລະ ຈັດຮຽງ." },
  racking: { label: "ຊັ້ນວາງ ແລະ ຊັ້ນເກັບ", blurb: "ການຈັດເກັບທີ່ວາງແຜນຕາມສິນຄ້າຂອງທ່ານ." },
  cleaning: { label: "ອຸປະກອນທຳຄວາມສະອາດ", navLabel: "ທຳຄວາມສະອາດ", blurb: "ເຄື່ອງທຳຄວາມສະອາດມືອາຊີບ Nilfisk." },
  industries: { label: "ອຸດສາຫະກຳ", blurb: "ວິທີແກ້ໄຂດ້ານອຸປະກອນຕາມອຸດສາຫະກຳ." },
  "ind-logistics": { label: "ໂລຈິສຕິກ ແລະ ສາງສິນຄ້າ", blurb: "ອຸປະກອນສຳລັບວຽກໂລຈິສຕິກ." },
  "ind-manufacturing": { label: "ການຜະລິດ", blurb: "ອຸປະກອນສຳລັບໂຮງງານ ແລະ ສາຍການຜະລິດ." },
  "ind-construction": { label: "ກໍ່ສ້າງ", blurb: "ການເຊົ່າ ແລະ ອຸປະກອນສຳລັບໜ້າວຽກກໍ່ສ້າງ." },
  "ind-food-beverage": { label: "ອາຫານ ແລະ ເຄື່ອງດື່ມ", blurb: "ອຸປະກອນສຳລັບຜູ້ຜະລິດອາຫານ ແລະ ເຄື່ອງດື່ມ." },
  "ind-retail": { label: "ຂາຍຍ່ອຍ ແລະ ຂາຍສົ່ງ", blurb: "ອຸປະກອນສຳລັບຮ້ານຄ້າ ແລະ ຜູ້ຂາຍສົ່ງ." },
  "ind-hospitality": { label: "ໂຮງແຮມ ແລະ ອາຄານ", blurb: "ອຸປະກອນທຳຄວາມສະອາດ ແລະ ອື່ນໆ ສຳລັບໂຮງແຮມ ແລະ ອາຄານ." },
  knowledge: { label: "ສູນຄວາມຮູ້", blurb: "ຄູ່ມືພາກປະຕິບັດກ່ຽວກັບລົດຍົກ ແລະ ສາງສິນຄ້າ." },
  article: { label: "ວິທີກະກຽມຄຳຂໍເຊົ່າ", blurb: "ລາຍການກວດກ່ອນຂໍລາຄາເຊົ່າ." },
  contact: { label: "ຕິດຕໍ່ DK LAO", navLabel: "ຕິດຕໍ່", blurb: "ລົມກັບທີ່ປຶກສາ DK LAO." },
  quote: { label: "ຂໍໃບສະເໜີລາຄາ", blurb: "ແບບຟອມດຽວສຳລັບທຸກຄວາມຕ້ອງການດ້ານອຸປະກອນ ຫຼື ບໍລິການ." },
};
