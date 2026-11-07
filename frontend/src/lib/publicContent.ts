import { useSiteConfig } from './siteConfig';

export interface PublicContent {
  categoryDisplayNames: Record<string, string>;
"heroSlides": ({
"id": string;
"series": string;
"tab": string;
"range": string;
"title": string;
"background": string;
"preferredModels": (string)[];
"intro": string;
"highlights": (string)[];
"imageUrl": string;
})[];
"faqs": ((string)[])[];
"seriesGuide": ({
"series": string;
"capacity": string;
"technology": string;
"pressure": string;
"positioning": string;
"industries": string;
"summary": string;
})[];
"infoPages": {
"about": {
"eyebrow": string;
"title": string;
"intro": string;
"icon": string;
"points": (string)[];
};
"technical": {
"eyebrow": string;
"title": string;
"intro": string;
"icon": string;
"points": (string)[];
};
"warranty": {
"eyebrow": string;
"title": string;
"intro": string;
"icon": string;
"points": (string)[];
};
};
"technicalChecklist": ({
"icon": string;
"title": string;
"text": string;
})[];
"brochures": ({
"title": string;
"detail": string;
"href": string;
})[];
"technicalFaqs": ({
"question": string;
"answer": string;
})[];
"warrantyFaqs": ({
"question": string;
"answer": string;
})[];
"aboutHighlights": ({
"icon": string;
"title": string;
"text": string;
})[];
"productOrder": (string)[];
"productSeries": ({
"key": string;
"title": string;
"range": string;
"family": string;
"min": number;
"max": number;
})[];
"footer": {
"logoUrl": string;
};
"productLinks": ({
"label": string;
"page": string;
"param"?: string;
})[];
"companyLinks": ({
"label": string;
"page": string;
})[];
"routeMeta": {
"/": {
"title": string;
"description": string;
"keywords": string;
};
"/products": {
"title": string;
"description": string;
"keywords": string;
};
"/technical-information": {
"title": string;
"description": string;
"keywords": string;
};
"/warranty-information": {
"title": string;
"description": string;
"keywords": string;
};
"/faq": {
"title": string;
"description": string;
"keywords": string;
};
"/industries": {
"title": string;
"description": string;
"keywords": string;
};
"/services": {
"title": string;
"description": string;
"keywords": string;
};
"/distributors": {
"title": string;
"description": string;
"keywords": string;
};
"/contact": {
"title": string;
"description": string;
"keywords": string;
};
"/about/story": {
"title": string;
"description": string;
"keywords": string;
};
"/about/timeline": {
"title": string;
"description": string;
"keywords": string;
};
"/about/careers": {
"title": string;
"description": string;
"keywords": string;
};
};
"productGuidance": ({
"family": string;
"minPowerKw": number;
"duty": string;
"bestFor": string;
})[];
"quickActions": ({
"label": string;
"prompt": string;
"icon": string;
})[];
"chatbot": {
"greeting": string;
"greetingLinks": ({
"label": string;
"page": string;
})[];
"thinking": string;
"unavailable": string;
"checking": string;
"ready": string;
"offline": string;
};
"text": Record<string, Record<string, string>>;
}

export function usePublicContent(): PublicContent { return useSiteConfig().config.publicContent; }
