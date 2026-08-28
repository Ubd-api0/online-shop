import React from "react";
import {
  FiTruck,
  FiGift,
  FiTag,
  FiShield,
  FiCreditCard,
  FiClock,
  FiRefreshCw,
  FiHeadphones,
  FiThumbsUp,
  FiPercent,
  FiPackage,
  FiAward,
} from "react-icons/fi";

// Preset icons the owner can choose for storefront feature tiles.
export const TILE_ICONS = {
  truck: FiTruck,
  gift: FiGift,
  tag: FiTag,
  shield: FiShield,
  card: FiCreditCard,
  clock: FiClock,
  refresh: FiRefreshCw,
  support: FiHeadphones,
  thumbsup: FiThumbsUp,
  percent: FiPercent,
  package: FiPackage,
  award: FiAward,
};

export const TILE_ICON_KEYS = Object.keys(TILE_ICONS);

export const TileIcon = ({ name, size = 32, className = "" }) => {
  const Icon = TILE_ICONS[name] || FiTruck;
  return <Icon size={size} className={className} />;
};
