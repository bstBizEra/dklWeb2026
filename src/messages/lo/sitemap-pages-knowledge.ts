// Lao overrides for the knowledge center and its article in src/lib/data/sitemap-pages.ts (merged by
// localizePage). Same shape as PageContent; sections and items follow the English order.
import type { PageContent } from "@/lib/data/pages";
import type { DeepPartial } from "@/lib/i18n/localize";

const quoteClosing = {
  title: "ຮັບໃບສະເໜີລາຄາ",
  copy: "ບອກພວກເຮົາວ່າທ່ານຕ້ອງການຫຍັງ ແລະ ພວກເຮົາຈະຕອບກັບພ້ອມໃບສະເໜີລາຄາ.",
};

export const loKnowledgePages: Partial<Record<string, DeepPartial<PageContent>>> = {
  knowledge: {
    metaTitle: "ຄູ່ມືລົດຍົກ ແລະ ສາງສິນຄ້າ ສຳລັບລາວ",
    metaDescription:
      "ຄູ່ມືພາກປະຕິບັດກ່ຽວກັບການເຊົ່າ, ການຊື້, ການບຳລຸງຮັກສາ, ອາໄຫຼ່ ແລະ ອຸປະກອນສາງ ລົດຍົກ ສຳລັບທຸລະກິດໃນລາວ.",
    eyebrow: "ສູນຄວາມຮູ້",
    h1: "ຄູ່ມືລົດຍົກ ແລະ ສາງສິນຄ້າ",
    intro: "ຄຳຕອບສັ້ນໆ ແລະ ນຳໃຊ້ໄດ້ຈິງ ກ່ອນທ່ານຂໍໃບສະເໜີລາຄາ.",
    ctas: [{ label: "ຂໍໃບສະເໜີລາຄາ" }],
    sections: [
      {
        title: "ຄູ່ມືລ່າສຸດ",
        items: [
          { title: "ວິທີກະກຽມຄຳຂໍເຊົ່າລົດຍົກ", description: "ການເຊົ່າ" },
          { title: "ວິທີເລືອກກຳລັງຍົກຂອງລົດຍົກ", description: "ການຊື້" },
          { title: "ສິ່ງທີ່ຕ້ອງກວດໃນລົດຍົກມືສອງ", description: "ການຊື້" },
          { title: "ລາຍລະອຽດໃດທີ່ຊ່ວຍຈັບຄູ່ອາໄຫຼ່", description: "ອາໄຫຼ່" },
          { title: "ການເລືອກເຄື່ອງຂັດພື້ນ", description: "ທຳຄວາມສະອາດ" },
          { title: "ລົດຍົກໄຟຟ້າ ຫຼື ດີເຊລ?", description: "ການຊື້" },
        ],
      },
    ],
    closing: { ...quoteClosing, primary: { label: "ຂໍໃບສະເໜີລາຄາ" } },
  },

  article: {
    metaTitle: "ວິທີກະກຽມຄຳຂໍເຊົ່າລົດຍົກ",
    metaDescription:
      "ລາຍການກວດສັ້ນໆ ກ່ຽວກັບສິ່ງທີ່ຕ້ອງກະກຽມ ກ່ອນຂໍເຊົ່າລົດຍົກໃນລາວ, ເພື່ອໃຫ້ທ່ານໄດ້ຮັບໃບສະເໜີລາຄາທີ່ຖືກຕ້ອງໄວຂຶ້ນ.",
    eyebrow: "ສູນຄວາມຮູ້ · ຄູ່ມືການເຊົ່າ",
    h1: "ວິທີກະກຽມຄຳຂໍເຊົ່າລົດຍົກ",
    intro: "ລາຍການກວດສັ້ນໆ ກ່ຽວກັບສິ່ງທີ່ຕ້ອງກະກຽມ ກ່ອນທ່ານສອບຖາມລາຄາເຊົ່າລົດຍົກ, ເພື່ອໃຫ້ໃບສະເໜີລາຄາກັບມາໄວຂຶ້ນ.",
    sections: [
      {
        title: "ຫ້າສິ່ງທີ່ຕ້ອງກະກຽມ",
        items: [
          {
            title: "ສິນຄ້າແມ່ນຫຍັງ?",
            description: "ນ້ຳໜັກຂອງພາເລັດ ຫຼື ສິນຄ້າທີ່ໜັກທີ່ສຸດທີ່ທ່ານຍົກ. ບອກຂະໜາດນຳ ຖ້າມັນຜິດປົກກະຕິ.",
          },
          {
            title: "ຕ້ອງຍົກສູງເທົ່າໃດ?",
            description: "ຄວາມສູງຂອງຊັ້ນວາງ ຫຼື ການຊ້ອນທີ່ສູງທີ່ສຸດທີ່ທ່ານຍົກເຖິງ, ເປັນແມັດ (m).",
          },
          {
            title: "ຈະເຮັດວຽກຢູ່ໃສ?",
            description: "ພາຍໃນ ຫຼື ພາຍນອກ, ສະພາບພື້ນ, ທາງຊັນ, ປະຕູ ແລະ ທາງແຄບລະຫວ່າງຊັ້ນວາງ.",
          },
          {
            title: "ທ່ານຕ້ອງການດົນປານໃດ?",
            description: "ວັນທີເລີ່ມ ແລະ ໄລຍະທີ່ທ່ານຄາດວ່າຈະຕ້ອງໃຊ້ລົດຍົກ, ຕັ້ງແຕ່ຫຼາຍມື້ ຫາ ຫຼາຍເດືອນ.",
          },
          {
            title: "ມີຫຍັງອີກທີ່ຊ່ວຍໃຫ້ພວກເຮົາສະເໜີລາຄາໄວຂຶ້ນ?",
            description: "ປະເພດພະລັງງານທີ່ທ່ານຕ້ອງການ (ໄຟຟ້າ, ດີເຊລ ຫຼື LPG), ທີ່ຢູ່ຈັດສົ່ງ ແລະ ຂໍ້ຈຳກັດໃນການເຂົ້າເຖິງສະຖານທີ່.",
          },
        ],
      },
      {
        title: "ຄູ່ມື ແລະ ໜ້າທີ່ກ່ຽວຂ້ອງ",
        items: [{ title: "ເຊົ່າໄລຍະສັ້ນ" }, { title: "ຄູ່ມືເພີ່ມເຕີມ" }],
      },
    ],
    closing: {
      title: "ພ້ອມສົ່ງຄຳຂໍແລ້ວບໍ?",
      copy: quoteClosing.copy,
      primary: { label: "ສອບຖາມລາຄາເຊົ່າ" },
      secondary: { label: "ເບິ່ງທາງເລືອກການເຊົ່າ" },
    },
  },
};
