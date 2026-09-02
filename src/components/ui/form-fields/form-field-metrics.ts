/**
 * Shared metrics so every form control (text, numeric, read-only, date) lines
 * up on the same height and corner radius. Material's `OutlinedTextField`
 * defaults to a 56dp min height and a 4dp corner; we opt into a slightly
 * rounder 12dp and apply the identical value to the custom read-only/date
 * frames so nothing looks taller or boxier than its neighbours.
 */
export const FORM_FIELD_MIN_HEIGHT = 56;
export const FORM_FIELD_CORNER_RADIUS = 12;

/** Corner radii object reused by both `Shape.RoundedCorner` and the `clip` modifier. */
export const FORM_FIELD_CORNERS = {
  topStart: FORM_FIELD_CORNER_RADIUS,
  topEnd: FORM_FIELD_CORNER_RADIUS,
  bottomStart: FORM_FIELD_CORNER_RADIUS,
  bottomEnd: FORM_FIELD_CORNER_RADIUS,
} as const;
