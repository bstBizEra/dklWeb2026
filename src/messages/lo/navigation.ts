// Lao overrides for src/lib/data/navigation.ts: the built-in header menu (used when the CMS has no saved
// menu), the mega menu group titles (Equipment, Service & parts) and the promo card. Arrays follow the
// English order; routeId, image and ctaHref stay English.
import type { NavigationText } from "@/lib/data/navigation";
import type { DeepPartial } from "@/lib/i18n/localize";
import { loRoutes } from "@/messages/lo/routes";

// Descriptions reuse the Lao route blurbs, as the English menu reuses the English ones.
const solution = (routeId: string, label: string) => ({ label, description: loRoutes[routeId]?.blurb });

export const loNavigation: DeepPartial<NavigationText> = {
  defaultNavigation: [
    {
      label: "ວິທີແກ້ໄຂ",
      children: [
        solution("rental", "ເຊົ່າລົດຍົກ"),
        solution("sales", "ລົດຍົກຂາຍ"),
        solution("maintenance", "ບໍລິການບຳລຸງຮັກສາ"),
        solution("parts", "ອາໄຫຼ່"),
        solution("batteries", "ແບັດເຕີຣີ ແລະ ເຄື່ອງສາກ"),
        solution("warehouse", "ອຸປະກອນສາງ"),
        solution("cleaning", "ອຸປະກອນທຳຄວາມສະອາດ"),
      ],
    },
    { label: "ອຸດສາຫະກຳ" },
    { label: "ສູນຄວາມຮູ້" },
    { label: "ກ່ຽວກັບພວກເຮົາ" },
    { label: "ຕິດຕໍ່" },
  ],
  menuGroupTitles: ["ອຸປະກອນ", "ບໍລິການ ແລະ ອາໄຫຼ່"],
  solutionsPromo: {
    imageAlt: "ລົດຍົກເຊົ່າຂອງ DK LAO ຈອດຢູ່ນອກຫ້ອງການ DK LAO ໃນນະຄອນຫຼວງວຽງຈັນ",
    title: "ບໍ່ແນ່ໃຈວ່າວິທີແກ້ໄຂໃດເໝາະສົມ?",
    copy: "ແຈ້ງນ້ຳໜັກສິນຄ້າ, ສະຖານທີ່ ແລະ ເວລາ. ທີ່ປຶກສາຈະແນະນຳອຸປະກອນ ແລະ ສົ່ງໃບສະເໜີລາຄາໃຫ້.",
    ctaLabel: "ຂໍໃບສະເໜີລາຄາ",
  },
};
