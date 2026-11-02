// Lao overrides for src/lib/data/footer.ts: short link labels keyed by route id (pages not listed use
// their route label from routes.ts) and the four group titles in English order.
import type { FooterText } from "@/lib/data/footer";
import type { DeepPartial } from "@/lib/i18n/localize";

export const loFooter: DeepPartial<FooterText> = {
  labels: {
    rental: "ການເຊົ່າ",
    "rental-short": "ໄລຍະສັ້ນ",
    "rental-long": "ໄລຍະຍາວ",
    sales: "ຂາຍ",
    "sales-new": "ໃໝ່",
    "sales-used": "ໃຊ້ແລ້ວ",
    maintenance: "ບຳລຸງຮັກສາ",
    batteries: "ແບັດເຕີຣີ",
    warehouse: "ສາງສິນຄ້າ",
    racking: "ຊັ້ນວາງ",
    cleaning: "ທຳຄວາມສະອາດ",
    about: "ກ່ຽວກັບພວກເຮົາ",
    article: "ຄູ່ມືການເຊົ່າ",
  },
  groupTitles: ["ເຊົ່າ ແລະ ຊື້", "ບໍລິການ ແລະ ອາໄຫຼ່", "ສາງ ແລະ ທຳຄວາມສະອາດ", "ບໍລິສັດ ແລະ ຄູ່ມື"],
};
