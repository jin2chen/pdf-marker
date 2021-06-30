import { TAG_TYPE, SIGNATURE_TYPE, SIGNATURE_HEIGHT } from "@/core/constant";

const simpleClone = o => {
  return JSON.parse(JSON.stringify(o));
};

const tidyShape = (shape, viewport, pid) => {
  shape.pid = pid;
  shape.viewport = viewport;

  if (!shape.section || shape.section.trim() === "") {
    shape.section = `sec${pid}`;
  }

  ["left", "top", "width", "height"].forEach(key => {
    if (shape[key] !== undefined) {
      shape[key] = Math.round(shape[key]);
    }
  });

  return shape;
};

const tag2shape = (tag, sec, viewport, pid) => {
  const shape = simpleClone(tag);
  const { area } = shape;
  const { scale } = viewport;

  ["area"].forEach(key => delete shape[key]);
  area.w = area.w <= 0 ? 10 : area.w;
  area.h = area.h <= 0 ? 10 : area.h;

  ["x", "y", "w", "h"].forEach(
    key => (area[key] = Number.parseFloat(area[key]))
  );

  // amend for signature
  if (tag.type === TAG_TYPE.SIGNATURE) {
    if (tag.signatureType === SIGNATURE_TYPE.DATE) {
      area.y = area.y - area.h + SIGNATURE_HEIGHT.DATE;
    } else if (tag.signatureType === SIGNATURE_TYPE.SIGNATURE) {
      area.y =
        area.y -
        area.h +
        SIGNATURE_HEIGHT.SIGNATURE * Number.parseFloat(tag.scaleValue);
    }
    area.y += 20;
  }

  Object.assign(shape, {
    section: sec,
    left: Math.round(area.x * scale),
    top: Math.round(area.y * scale),
    width: Math.round(area.w * scale),
    height: Math.round(area.h * scale)
  });

  if ([TAG_TYPE.TEXT, TAG_TYPE.CHECKBOX].includes(shape.type)) {
    shape.top = Math.round(viewport.height - (area.y + area.h) * scale);
  }

  return tidyShape(shape, viewport, pid);
};

const shape2tag = shape => {
  let tag = simpleClone(shape);
  const { left, top, width, height, viewport, section } = tag;
  const scale = viewport.scale;

  ["left", "top", "width", "height", "pid", "viewport"].forEach(
    key => delete tag[key]
  );

  tag = Object.assign(tag, {
    type: tag.type.toLowerCase(),
    area: {
      x: Math.round(left / scale),
      y: Math.round(top / scale),
      w: Math.round(width / scale),
      h: Math.round(height / scale)
    }
  });

  if ([TAG_TYPE.TEXT, TAG_TYPE.CHECKBOX].includes(tag.type)) {
    tag.area.y = Math.round((viewport.height - top - height) / scale);
  }

  if (tag.type === TAG_TYPE.TEXT) {
    ["value", "signatureType", "scaleValue"].forEach(key => delete tag[key]);
  } else if (tag.type === TAG_TYPE.CHECKBOX) {
    ["signatureType", "scaleValue"].forEach(key => delete tag[key]);
  } else if (tag.type === TAG_TYPE.SIGNATURE) {
    ["value"].forEach(key => delete tag[key]);
  }

  // amend for signature
  if (tag.type === TAG_TYPE.SIGNATURE) {
    if (tag.signatureType === SIGNATURE_TYPE.DATE) {
      tag.area.y = tag.area.y + tag.area.h - SIGNATURE_HEIGHT.DATE;
    } else if (tag.signatureType === SIGNATURE_TYPE.SIGNATURE) {
      tag.area.y =
        tag.area.y + tag.area.h - SIGNATURE_HEIGHT.SIGNATURE * tag.scaleValue;
    }

    tag.area.y -= 20;
  }

  return tag;
};

const flatCheckbox = tag => {
  const tags = [];
  if (tag.type === TAG_TYPE.CHECKBOX) {
    const copyTag = simpleClone(tag);
    delete copyTag["areas"];

    Object.entries(tag.areas).forEach(entry => {
      const tag = simpleClone(copyTag);
      const [key, area] = entry;

      tags.push(
        Object.assign(tag, {
          area: area,
          value: key
        })
      );
    });
  } else {
    tags.push(tag);
  }

  return tags;
};

export default {
  simpleClone,
  tidyShape,
  tag2shape,
  shape2tag,
  flatCheckbox
};
