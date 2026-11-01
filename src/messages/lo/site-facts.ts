// Lao overrides for src/lib/data/site-facts.ts: wording of the owner-confirmed text facts only. Phone
// numbers, WhatsApp, email and social links are never translated. A fact that is null in English stays
// hidden whatever is written here. With a database the CMS Site facts global (locale lo) is used instead.
import type { SiteFacts } from "@/lib/data/site-facts";

type TextFact = "address" | "hours" | "serviceAreas" | "quoteReplyTime" | "deliveryCoverage" | "maintenanceTerms" | "rentToBuyTerms" | "brands";

export const loSiteFacts: Partial<Pick<SiteFacts, TextFact>> = {
  address: "ເລກທີ 24, ຖະໜົນຄຳແພງເມືອງ, ບ້ານໜອງໄຮ, ເມືອງຫາດຊາຍຟອງ, ນະຄອນຫຼວງວຽງຈັນ, ສ.ປ.ປ. ລາວ",
  hours: "ເປີດ 24/7. ຕົວແທນ AI ແລະ ທີ່ປຶກສາເຮັດວຽກຮ່ວມກັນ.",
  serviceAreas: "ຕັ້ງຢູ່ນະຄອນຫຼວງວຽງຈັນ. ພວກເຮົາຍັງບໍລິການລູກຄ້າອອນລາຍຜ່ານ Facebook, WhatsApp ແລະ ໂທລະສັບ.",
  quoteReplyTime: "ສົ່ງຄຳຂໍໄດ້ທຸກເວລາ, 24/7. ຕົວແທນ AI ແລະ ທີ່ປຶກສາເຮັດວຽກຮ່ວມກັນເພື່ອຕອບກັບ.",
  brands: "ພວກເຮົາສະໜອງຍີ່ຫໍ້ທີ່ກົງກັບຄວາມຕ້ອງການຂອງທ່ານ. ບອກພວກເຮົາກ່ຽວກັບນ້ຳໜັກສິນຄ້າ, ຄວາມສູງໃນການຍົກ ແລະ ສະຖານທີ່ ແລ້ວພວກເຮົາຈະແນະນຳໃຫ້.",
};
