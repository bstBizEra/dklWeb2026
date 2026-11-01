// Lao overrides for src/lib/data/homepage.ts (Home hero CTAs, quick quote bar, solution, category,
// industry and knowledge cards). Same shape as HomepageContent; arrays follow the English order.
// Only text is used: hrefs, icons and variants always stay English.
import type { HomepageContent } from "@/lib/data/homepage";
import type { DeepPartial } from "@/lib/i18n/localize";

export const loHomepage: DeepPartial<HomepageContent> = {
  homepageCtas: [
    { label: "ຂໍໃບສະເໜີລາຄາ" },
    { label: "ເບິ່ງລາຍການລົດເຊົ່າ" },
    { label: "ຈອງບໍລິການບຳລຸງຮັກສາ" },
  ],
  quickQuoteActions: [
    {
      title: "ສອບຖາມການເຊົ່າ",
      description: "ແຈ້ງກຳລັງຍົກ, ຄວາມສູງຍົກ, ສະພາບໜ້າວຽກ ແລະ ໄລຍະເວລາເຊົ່າ.",
      ctaLabel: "ຖາມລາຄາເຊົ່າ",
    },
    {
      title: "ຈອງບໍລິການ",
      description: "ຂໍບໍລິການບຳລຸງຮັກສາລົດຍົກ ນອກສະຖານທີ່ ຫຼື ໃນສູນຊ່ອມ.",
      ctaLabel: "ຈອງບໍລິການບຳລຸງຮັກສາ",
    },
    {
      title: "ອາໄຫຼ່",
      description: "ສົ່ງປະເພດອາໄຫຼ່, ຍີ່ຫໍ້, ລຸ້ນ, ເລກຈັກ ແລະ ຄວາມຮີບດ່ວນ.",
      ctaLabel: "ຂໍອາໄຫຼ່",
    },
    {
      title: "ສຳຫຼວດສະຖານທີ່",
      description: "ວາງແຜນຊັ້ນວາງ, ການໄຫຼວຽນໃນສາງ, ອຸປະກອນທຳຄວາມສະອາດ ຫຼື ຄວາມຕ້ອງການລົດຍົກ.",
      ctaLabel: "ນັດສຳຫຼວດສະຖານທີ່",
    },
  ],
  solutionCards: [
    {
      title: "ເຊົ່າລົດຍົກ",
      description: "ໄລຍະສັ້ນສຳລັບໂຄງການ ແລະ ຊ່ວງວຽກຫຼາຍ, ໄລຍະຍາວສຳລັບການດຳເນີນງານປະຈຳ.",
      ctaLabel: "ເບິ່ງລາຍການລົດເຊົ່າ",
    },
    {
      title: "ຂາຍລົດຍົກໃໝ່ ແລະ ໃຊ້ແລ້ວ",
      description: "ລົດຍົກໃໝ່ ແລະ ໃຊ້ແລ້ວ ທີ່ເໝາະກັບນ້ຳໜັກ, ຄວາມສູງຍົກ ແລະ ສະຖານທີ່ຂອງທ່ານ.",
      ctaLabel: "ເລືອກລົດຍົກ",
    },
    {
      title: "ບຳລຸງຮັກສາ ແລະ ຊ່ອມແປງ",
      description: "ບຳລຸງຮັກສາຕາມກຳນົດ, ຊ່ອມເມື່ອເປ່ເພ ແລະ ກວດສະພາບ ເພື່ອໃຫ້ລົດພ້ອມເຮັດວຽກ.",
      ctaLabel: "ຈອງບໍລິການບຳລຸງຮັກສາ",
    },
    {
      title: "ອາໄຫຼ່ ແລະ ອຸປະກອນເສີມ",
      description: "ສົ່ງລຸ້ນ ແລະ ເລກຈັກມາ ແລ້ວພວກເຮົາຈະຫາອາໄຫຼ່ທີ່ຖືກຕ້ອງໃຫ້.",
      ctaLabel: "ຂໍອາໄຫຼ່",
    },
  ],
  productCategories: [
    {
      eyebrow: "ການຂົນຍ້າຍວັດສະດຸ",
      title: "ລົດຍົກ ແລະ ການຍ້າຍພາເລດ",
      description: "ລົດຍົກ, ລົດລາກພາເລດ ແລະ Stacker ທີ່ເລືອກຕາມສິ່ງທີ່ທ່ານຂົນຍ້າຍ.",
      ctaLabel: "ເລືອກອຸປະກອນ",
    },
    {
      eyebrow: "ສາງສິນຄ້າ",
      title: "ຊັ້ນວາງ ແລະ ລະບົບຈັດເກັບ",
      description: "ຊັ້ນວາງ ແລະ ຊັ້ນເກັບ ທີ່ວາງແຜນຕາມສິນຄ້າ ແລະ ອາຄານຂອງທ່ານ.",
      ctaLabel: "ເລືອກວິທີແກ້ໄຂສາງ",
    },
    {
      eyebrow: "ພະລັງງານ",
      title: "ແບັດເຕີຣີ ແລະ ເຄື່ອງສາກ",
      description: "ແບັດເຕີຣີ ແລະ ເຄື່ອງສາກ ທີ່ເໝາະກັບລົດ ແລະ ຊົ່ວໂມງເຮັດວຽກຂອງທ່ານ.",
      ctaLabel: "ຂໍຄຳແນະນຳ",
    },
    {
      eyebrow: "ທຳຄວາມສະອາດ",
      title: "ອຸປະກອນທຳຄວາມສະອາດ",
      description: "ເຄື່ອງຂັດ-ດູດນ້ຳ, ເຄື່ອງກວາດ ແລະ ເຄື່ອງດູດຝຸ່ນ Nilfisk ສຳລັບສາງ, ໂຮງງານ ແລະ ຮ້ານຄ້າ.",
      ctaLabel: "ຂໍຄຳແນະນຳ",
    },
  ],
  industrySolutions: [
    {
      title: "ໂລຈິສຕິກ ແລະ ສາງສິນຄ້າ",
      description: "ຊ່ວງວຽກຫຼາຍ, ທ່າຂົນສົ່ງ ແລະ ການຈັດເກັບ ທີ່ເຮັດໃຫ້ສິນຄ້າເຄື່ອນໄຫວຕໍ່ເນື່ອງ.",
      ctaLabel: "ເບິ່ງອຸດສາຫະກຳ",
    },
    {
      title: "ການຜະລິດ",
      description: "ການໄຫຼວຽນຢ່າງສະໝ່ຳສະເໝີ ລະຫວ່າງສາງ, ສາຍການຜະລິດ ແລະ ຈຸດສົ່ງອອກ.",
      ctaLabel: "ເບິ່ງອຸດສາຫະກຳ",
    },
    {
      title: "ກໍ່ສ້າງ",
      description: "ສິນຄ້າໜັກເທິງພື້ນທີ່ບໍ່ສະເໝີ ຕະຫຼອດໄລຍະໂຄງການ.",
      ctaLabel: "ເບິ່ງອຸດສາຫະກຳ",
    },
    {
      title: "ອາຫານ, ຂາຍຍ່ອຍ ແລະ ໂຮງແຮມ",
      description: "ພື້ນສະອາດ, ການຈັດສົ່ງໄວ ແລະ ສາງທີ່ເປັນລະບຽບ.",
      ctaLabel: "ເບິ່ງອຸດສາຫະກຳ",
    },
  ],
  knowledgeArticles: [
    { title: "ວິທີກະກຽມຄຳຂໍເຊົ່າລົດຍົກ", category: "ຄູ່ມືການເຊົ່າ" },
    { title: "ເລກຈັກໃດທີ່ຊ່ວຍໃນການຫາອາໄຫຼ່ໃຫ້ກົງ", category: "ຄູ່ມືອາໄຫຼ່" },
    { title: "ການເລືອກອຸປະກອນທຳຄວາມສະອາດສຳລັບພື້ນສາງ", category: "ຄູ່ມືທຳຄວາມສະອາດ" },
  ],
};
