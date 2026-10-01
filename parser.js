// @todo: напишите здесь код парсера

function parseMeta() {
  const language = document.documentElement.getAttribute("lang") || "";
  const fullTitle = document.title || "";
  const title = fullTitle.split("—")[0].trim();
  const keywordsMeta = document.querySelector('meta[name="keywords"]');
  const keywords = keywordsMeta
    ? keywordsMeta
        .getAttribute("content")
        .split(",")
        .map((k) => k.trim())
    : [];
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const description = descriptionMeta
    ? descriptionMeta.getAttribute("content").trim()
    : "";
  const opengraph = {};
  document.querySelectorAll('meta[property^="og:"]').forEach((meta) => {
    const key = meta.getAttribute("property").slice(3);
    opengraph[key] = meta.getAttribute("content").trim();
  });

  return { title, description, keywords, language, opengraph };
}

function parsePriceText(text) {
  const currencyMap = { "₽": "RUB", "\$": "USD", "€": "EUR" };
  const symbolMatch = text.match(/[₽$€]/);
  const symbol = symbolMatch ? symbolMatch[0] : "";
  const currency = currencyMap[symbol] || "";
  const price = parseFloat(text.replace(/[^\d.]/g, "")) || 0;

  return { price, currency };
}

function parseProduct() {
  const section = document.querySelector("section.product");
  const id = section.getAttribute("data-id") || "";
  const name = section.querySelector("h1.title").textContent.trim();
  const likeButton = section.querySelector(".like");
  const isLiked = likeButton ? likeButton.classList.contains("active") : false;
  const tags = { category: [], discount: [], label: [] };
  section.querySelectorAll(".tags span").forEach((tag) => {
    const text = tag.textContent.trim();
    if (tag.classList.contains("green")) tags.category.push(text);
    else if (tag.classList.contains("blue")) tags.label.push(text);
    else if (tag.classList.contains("red")) tags.discount.push(text);
  });

  const priceDiv = section.querySelector(".price");
  const priceText = priceDiv.childNodes[0]
    ? priceDiv.childNodes[0].textContent.trim()
    : "";
  const { price, currency } = parsePriceText(priceText);
  const oldPriceSpan = priceDiv.querySelector("span");
  const oldPriceText = oldPriceSpan ? oldPriceSpan.textContent.trim() : "";
  const oldPrice = oldPriceText ? parsePriceText(oldPriceText).price : 0;
  const discount = oldPrice > 0 ? oldPrice - price : 0;
  const discountPercent =
    oldPrice > 0 ? ((discount / oldPrice) * 100).toFixed(2) + "%" : "0%";
  const properties = {};

  section.querySelectorAll(".properties li").forEach((li) => {
    const spans = li.querySelectorAll("span");
    if (spans.length >= 2) {
      properties[spans[0].textContent.trim()] = spans[1].textContent.trim();
    }
  });

  const descElement = section.querySelector(".description");
  const descClone = descElement.cloneNode(true);
  descClone.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => el.removeAttribute(attr.name));
  });
  const description = descClone.innerHTML;
  const allThumbs = [...section.querySelectorAll(".preview nav button img")];
  const sortedThumbs = [...allThumbs];
  const selectedIndex = allThumbs.findIndex((img) =>
    img.parentElement.hasAttribute("disabled"),
  );
  if (selectedIndex > 0) {
    const [selected] = sortedThumbs.splice(selectedIndex, 1);
    sortedThumbs.unshift(selected);
  }

  const images = sortedThumbs.map((img) => ({
    preview: img.getAttribute("src"),
    full: img.getAttribute("data-src"),
    alt: img.getAttribute("alt"),
  }));

  return {
    id,
    name,
    isLiked,
    tags,
    price,
    oldPrice,
    discount,
    discountPercent,
    currency,
    properties,
    description,
    images,
  };
}

function parseSuggested() {
  const items = document.querySelectorAll("section.suggested .items article");
  return [...items].map((article) => {
    const img = article.querySelector("img");
    const name = article.querySelector("h3").textContent.trim();
    const b = article.querySelector("b");
    const p = article.querySelector("p");
    const priceText = b ? b.textContent.trim() : "";
    const { currency } = parsePriceText(priceText);
    const price = priceText.replace(/[^\d.]/g, "");

    return {
      name,
      description: p ? p.textContent.trim() : "",
      image: img ? img.getAttribute("src") : "",
      price,
      currency,
    };
  });
}

function parseReviews() {
  const items = document.querySelectorAll("section.reviews .items article");

  return [...items].map((article) => {
    const rating = article.querySelectorAll(".rating .filled").length;
    const title = article.querySelector("h3").textContent.trim();
    const description = article.querySelector("p").textContent.trim();
    const authorDiv = article.querySelector(".author");
    const avatar = authorDiv.querySelector("img").getAttribute("src");
    const name = authorDiv.querySelector("span").textContent.trim();
    const dateText = authorDiv.querySelector("i").textContent.trim();
    const date = dateText.replace(/\//g, ".");

    return {
      rating,
      author: { avatar, name },
      title,
      description,
      date,
    };
  });
}

function parsePage() {
  return {
    meta: parseMeta(),
    product: parseProduct(),
    suggested: parseSuggested(),
    reviews: parseReviews(),
  };
}

window.parsePage = parsePage;
