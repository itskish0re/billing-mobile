package expo.modules.customaccordion

import android.graphics.Color
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import expo.modules.kotlin.types.Enumerable
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.FunctionalComposableScope
import expo.modules.kotlin.views.OptimizedComposeProps
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.types.OptimizedRecord
import expo.modules.ui.ModifierList
import expo.modules.ui.ModifierRegistry
import expo.modules.ui.UIComposableScope
import expo.modules.ui.composeOrNull

enum class AccordionVariant(val value: String) : Enumerable {
  BORDER("border"),
  CARD("card")
}

@OptimizedRecord
data class ExpandedChangeEvent(
  @Field val expanded: Boolean = false
) : Record

@OptimizedComposeProps
data class CustomAccordionProps(
  val title: String = "",
  val expanded: Boolean = false,
  val variant: AccordionVariant = AccordionVariant.BORDER,
  val containerColor: Color? = null,
  val contentColor: Color? = null,
  val dividerColor: Color? = null,
  val cornerRadius: Float = 12f,
  val elevation: Float = 1f,
  val headerPaddingStart: Float = 16f,
  val headerPaddingTop: Float = 0f,
  val headerPaddingEnd: Float = 16f,
  val headerPaddingBottom: Float = 0f,
  val contentPaddingStart: Float = 16f,
  val contentPaddingTop: Float = 16f,
  val contentPaddingEnd: Float = 16f,
  val contentPaddingBottom: Float = 16f,
  val contentSpacing: Float = 12f,
  val modifiers: ModifierList = emptyList()
) : ComposeProps

@Composable
fun FunctionalComposableScope.CustomAccordionContent(
  props: CustomAccordionProps,
  onExpandedChange: (ExpandedChangeEvent) -> Unit
) {
  val baseModifier = ModifierRegistry.applyModifiers(
    props.modifiers,
    appContext,
    composableScope,
    globalEventDispatcher
  )

  when (props.variant) {
    AccordionVariant.CARD -> CardAccordion(
      props = props,
      modifier = baseModifier,
      onExpandedChange = onExpandedChange
    )
    AccordionVariant.BORDER -> BorderAccordion(
      props = props,
      modifier = baseModifier,
      onExpandedChange = onExpandedChange
    )
  }
}

@Composable
private fun FunctionalComposableScope.CardAccordion(
  props: CustomAccordionProps,
  modifier: Modifier,
  onExpandedChange: (ExpandedChangeEvent) -> Unit
) {
  val shape = RoundedCornerShape(props.cornerRadius.dp)
  val defaults = CardDefaults.cardColors()
  val colors = CardDefaults.cardColors(
    containerColor = props.containerColor.composeOrNull ?: defaults.containerColor,
    contentColor = props.contentColor.composeOrNull ?: defaults.contentColor
  )

  Card(
    modifier = modifier.fillMaxWidth(),
    shape = shape,
    colors = colors,
    elevation = CardDefaults.cardElevation(defaultElevation = props.elevation.dp)
  ) {
    AccordionBody(
      props = props,
      showBottomDivider = false,
      onExpandedChange = onExpandedChange
    )
  }
}

@Composable
private fun FunctionalComposableScope.BorderAccordion(
  props: CustomAccordionProps,
  modifier: Modifier,
  onExpandedChange: (ExpandedChangeEvent) -> Unit
) {
  val containerColor =
    props.containerColor.composeOrNull ?: androidx.compose.ui.graphics.Color.Transparent

  Column(
    modifier = modifier
      .fillMaxWidth()
      .background(containerColor)
  ) {
    AccordionBody(
      props = props,
      showBottomDivider = true,
      onExpandedChange = onExpandedChange
    )
  }
}

@Composable
private fun FunctionalComposableScope.AccordionBody(
  props: CustomAccordionProps,
  showBottomDivider: Boolean,
  onExpandedChange: (ExpandedChangeEvent) -> Unit
) {
  val chevronRotation by animateFloatAsState(
    targetValue = if (props.expanded) 180f else 0f,
    animationSpec = spring(),
    label = "accordionChevron"
  )

  val titleColor =
    props.contentColor.composeOrNull ?: MaterialTheme.colorScheme.onSurface
  val iconTint =
    props.contentColor.composeOrNull ?: MaterialTheme.colorScheme.onSurfaceVariant
  val dividerColor =
    props.dividerColor.composeOrNull ?: MaterialTheme.colorScheme.outlineVariant

  Column(modifier = Modifier.fillMaxWidth()) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .clickable { onExpandedChange(ExpandedChangeEvent(expanded = !props.expanded)) }
        .padding(
          start = props.headerPaddingStart.dp,
          top = props.headerPaddingTop.dp,
          end = props.headerPaddingEnd.dp,
          bottom = props.headerPaddingBottom.dp
        ),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.SpaceBetween
    ) {
      Text(
        text = props.title,
        color = titleColor,
        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Medium),
        modifier = Modifier
          .weight(1f)
          .padding(vertical = 12.dp)
      )
      Icon(
        imageVector = Icons.Filled.KeyboardArrowDown,
        contentDescription = if (props.expanded) "Collapse" else "Expand",
        tint = iconTint,
        modifier = Modifier.rotate(chevronRotation)
      )
    }

    // Keep Children() composed while collapsed. AnimatedVisibility removes them from
    // composition and destroys Expo UI child hosts, which releases nested useNativeState
    // SharedObjects and crashes with "failed to define internal native state property".
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .clipToBounds()
        .animateContentSize(animationSpec = spring())
        .then(
          if (props.expanded) {
            Modifier.padding(
              start = props.contentPaddingStart.dp,
              top = props.contentPaddingTop.dp,
              end = props.contentPaddingEnd.dp,
              bottom = props.contentPaddingBottom.dp
            )
          } else {
            Modifier
              .height(0.dp)
              .graphicsLayer { alpha = 0f }
          }
        ),
      verticalArrangement = Arrangement.spacedBy(props.contentSpacing.dp)
    ) {
      Children(UIComposableScope(columnScope = this))
    }

    if (showBottomDivider) {
      HorizontalDivider(thickness = 1.dp, color = dividerColor)
    }
  }
}
