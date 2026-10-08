export type GuideAnswer = { text: string; href?: string; label?: string };

export function answerSiteQuestion(question: string): GuideAnswer {
  const q = question.trim().toLowerCase();
  if (/unsafe|danger|injur|accident|fire|emergency/.test(q)) {
    return { text: "If there is immediate danger, stop using the equipment and follow your site's safety procedure. For equipment service, tell DK LAO the model, location and symptoms.", href: "/maintenance-service", label: "Request service" };
  }
  if (/price|cost|stock|available|delivery date|warranty|discount/.test(q)) {
    return { text: "I can't confirm current prices, stock, delivery dates or warranty terms. Share your requirement and a DK LAO advisor will check it.", href: "/request-quote", label: "Ask for a confirmed quote" };
  }
  if (/rent|rental|hire|lease/.test(q)) {
    return { text: "For forklift rental, share the load, lift height, site conditions and rental period. An advisor can review the right option and availability.", href: "/forklift-rental", label: "Start a rental inquiry" };
  }
  if (/part|spare|battery|charger/.test(q)) {
    return { text: "For parts or power equipment, share the part reference plus the equipment model and serial number. DK LAO will check compatibility and availability.", href: "/spare-parts", label: "Ask about spare parts" };
  }
  if (/repair|maintain|service|broken|fault/.test(q)) {
    return { text: "Tell the service team the equipment model, symptoms, site and urgency. They can review the next step with you.", href: "/maintenance-service", label: "Request maintenance" };
  }
  if (/used|second.hand/.test(q)) {
    return { text: "For used forklifts, share the load, lift height, operating environment and timing. Current options must be confirmed by DK LAO.", href: "/forklift-sales/used", label: "Ask about used forklifts" };
  }
  if (/buy|sale|new forklift|purchase|forklift/.test(q)) {
    return { text: "For a forklift recommendation, share the load, lift height, operating environment and whether you prefer new or used equipment.", href: "/forklift-sales", label: "Explore forklift sales" };
  }
  if (/clean|floor|scrubber/.test(q)) {
    return { text: "For cleaning equipment, share the floor type, area to clean and operating conditions so an advisor can assess suitable options.", href: "/cleaning-equipment", label: "Ask about cleaning equipment" };
  }
  if (/warehouse|rack|shelv|pallet/.test(q)) {
    return { text: "For warehouse solutions, describe your storage needs, site dimensions and material flow. A site survey may help.", href: "/warehouse-equipment", label: "Discuss warehouse equipment" };
  }
  return { text: "I can guide you to forklift rental or sales, spare parts, maintenance, warehouse and cleaning equipment. Tell me what you need, or send your question to an advisor.", href: "/contact", label: "Contact DK LAO" };
}
