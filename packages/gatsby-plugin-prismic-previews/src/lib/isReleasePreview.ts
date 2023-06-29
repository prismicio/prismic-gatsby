import { getPreviewCookie } from "./getPreviewCookie";

export const isReleasePreview = (): boolean => {
	return /\/previews\/.*~.*\?websitePreviewId/.test(getPreviewCookie() || "");
};
