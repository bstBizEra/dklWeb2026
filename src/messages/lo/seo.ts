// Lao overrides for src/lib/data/seo.ts (Home and About search and share text).
// Same limits as English: title at most 60 characters, description at most 155.
import type { DeepPartial } from "@/lib/i18n/localize";
import type { aboutSeo, homeSeo } from "@/lib/data/seo";

// homeSeo and aboutSeo are declared `as const`, so their fields are English literal types. The text is
// checked against plain string fields with the same keys, then cast to the literal-typed override.
type SeoText = Record<keyof typeof homeSeo, string>;
type SeoOverride = DeepPartial<{ homeSeo: typeof homeSeo; aboutSeo: typeof aboutSeo }>;

const text: DeepPartial<{ homeSeo: SeoText; aboutSeo: SeoText }> = {
  homeSeo: {
    title: "ເຊົ່າ, ຂາຍ ແລະ ບໍລິການລົດຍົກໃນລາວ | DK LAO",
    description:
      "ເຊົ່າ, ຊື້ ແລະ ບຳລຸງຮັກສາລົດຍົກໃນລາວ. ອາໄຫຼ່, ອຸປະກອນສາງ ແລະ ເຄື່ອງທຳຄວາມສະອາດ ຈາກທີມດຽວ. ຂໍໃບສະເໜີລາຄາ.",
    shareTitle: "ເຊົ່າ, ຂາຍ ແລະ ບໍລິການລົດຍົກໃນລາວ | DK LAO",
    shareDescription: "ເຊົ່າ, ຂາຍລົດຍົກ, ອາໄຫຼ່, ບຳລຸງຮັກສາ, ອຸປະກອນສາງ ແລະ ເຄື່ອງທຳຄວາມສະອາດ ທົ່ວລາວ.",
  },
  aboutSeo: {
    title: "ກ່ຽວກັບພວກເຮົາ: ລົດຍົກ ແລະ ອຸປະກອນສາງໃນລາວ",
    description:
      "DK LAO ສະໜອງ ແລະ ບໍລິການລົດຍົກ, ອາໄຫຼ່, ອຸປະກອນສາງ ແລະ ເຄື່ອງທຳຄວາມສະອາດ ໃຫ້ທຸລະກິດທົ່ວລາວ.",
    shareTitle: "ກ່ຽວກັບ DK LAO: ຄູ່ຮ່ວມງານດ້ານລົດຍົກ ແລະ ສາງໃນລາວ",
    shareDescription:
      "DK LAO ແມ່ນໃຜ ແລະ ສະໜັບສະໜູນການເຊົ່າ, ຂາຍ, ບໍລິການ, ອາໄຫຼ່, ອຸປະກອນສາງ ແລະ ທຳຄວາມສະອາດໃນລາວແນວໃດ.",
  },
};

export const loSeo = text as SeoOverride;
