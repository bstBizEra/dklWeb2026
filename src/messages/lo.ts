// Lao interface wording. Mirrors src/messages/en.ts key for key: a missing key is a type error.
// Wording taken from the Lao glossary of the earlier site (src/messages/lo.ts on feature/services-all-products).
import type { Messages } from "./en";

export const lo: Messages = {
  skipToContent: "ຂ້າມໄປຫາເນື້ອຫາຫຼັກ",
  header: {
    navLabel: "ເມນູຫຼັກ ດີ.ເຄ. ລາວ",
    homeLabel: "ໜ້າຫຼັກ ດີ.ເຄ. ລາວ",
    requestQuote: "ຂໍໃບສະເໜີລາຄາ",
    mainMenu: "ເມນູຫຼັກ",
  },
  mobileMenu: {
    open: "ເປີດ/ປິດເມນູ",
    title: "ເມນູ",
    description: "ໜ້າຕ່າງໆໃນເວັບໄຊ ດີ.ເຄ. ລາວ",
    navLabel: "ເມນູມືຖື",
  },
  language: {
    label: "ເລືອກພາສາ",
    en: "EN",
    lo: "ລາວ",
    enName: "English",
    loName: "ພາສາລາວ",
  },
  notFound: {
    metaTitle: "ບໍ່ພົບໜ້ານີ້",
    metaDescription: "ໜ້ານີ້ອາດຖືກຍ້າຍ ຫຼື ຍັງບໍ່ທັນເຜີຍແຜ່. ກັບໄປໜ້າຫຼັກ ຫຼື ສົ່ງຄຳຂໍໃບສະເໜີລາຄາຫາ ດີ.ເຄ. ລາວ.",
    eyebrow: "ຂໍ້ຜິດພາດ 404",
    title: "ບໍ່ພົບໜ້ານີ້",
    copy: "ໜ້ານີ້ອາດຖືກຍ້າຍ ຫຼື ຍັງບໍ່ທັນເຜີຍແຜ່. ທ່ານສາມາດກັບໄປໜ້າຫຼັກ ຫຼື ສົ່ງຄຳຂໍ ແລະ ທີ່ປຶກສາ ດີ.ເຄ. ລາວ ຈະສົ່ງຕໍ່ໄປຍັງຂັ້ນຕອນທີ່ຖືກຕ້ອງ.",
    home: "ກັບໄປໜ້າຫຼັກ",
    quote: "ຂໍໃບສະເໜີລາຄາ",
    popular: "ໜ້າຍອດນິຍົມ",
  },
};
