package expo.modules.scrollabletabrow

import android.graphics.Color
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.layout.positionInParent
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.types.OptimizedRecord
import expo.modules.kotlin.views.AsyncFunctionHandle
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.FunctionalComposableScope
import expo.modules.kotlin.views.OptimizedComposeProps
import expo.modules.ui.ModifierList
import expo.modules.ui.ModifierRegistry
import expo.modules.ui.composeOrNull
import expo.modules.ui.state.ObservableState
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlinx.coroutines.launch

private const val TAB_HORIZONTAL_PADDING_DP = 16f
private const val TAB_VERTICAL_PADDING_TOP_DP = 12f
private const val TAB_VERTICAL_PADDING_BOTTOM_DP = 8f
private const val TAB_INDICATOR_HEIGHT_DP = 3f
private const val CONTENT_INSET_DP = 4f

@OptimizedRecord
data class TabItemRecord(
  @Field val id: String = "",
  @Field val label: String = ""
) : Record

@OptimizedRecord
data class TabSelectedEvent(
  @Field val index: Int = 0,
  @Field val id: String = ""
) : Record

@OptimizedComposeProps
data class ScrollableTabRowProps(
  val tabs: List<TabItemRecord> = emptyList(),
  val selectedIndex: Int = 0,
  /** Continuous pager position (page + offset). Prefer useNativeState for swipe sync. */
  val pagePosition: ObservableState? = null,
  val selectedColor: Color? = null,
  val unselectedColor: Color? = null,
  val indicatorColor: Color? = null,
  val modifiers: ModifierList = emptyList()
) : ComposeProps

private data class TabLayoutPx(
  val x: Float = 0f,
  val width: Float = 0f
)

private fun lerp(start: Float, end: Float, fraction: Float): Float {
  return start + (end - start) * fraction
}

@Composable
fun FunctionalComposableScope.ScrollableTabRowContent(
  props: ScrollableTabRowProps,
  animateScrollToIndex: AsyncFunctionHandle<Int>,
  onTabSelected: (TabSelectedEvent) -> Unit
) {
  val density = LocalDensity.current
  val scrollState = rememberScrollState()
  val scope = rememberCoroutineScope()
  val layouts = remember(props.tabs.size) {
    mutableStateListOf(*Array(props.tabs.size) { TabLayoutPx() })
  }
  var viewportWidthPx by remember { mutableFloatStateOf(0f) }

  val contentInsetPx = with(density) { CONTENT_INSET_DP.dp.toPx() }
  val marginPx = with(density) { TAB_HORIZONTAL_PADDING_DP.dp.toPx() }

  suspend fun scrollIndexIntoView(index: Int) {
    if (index !in layouts.indices || viewportWidthPx <= 0f) {
      return
    }
    val layout = layouts[index]
    if (layout.width <= 0f) {
      return
    }

    // Layouts are relative to the padded content; scroll space includes the inset.
    val tabStart = contentInsetPx + layout.x
    val tabEnd = tabStart + layout.width
    val visibleStart = scrollState.value.toFloat()
    val visibleEnd = visibleStart + viewportWidthPx

    val target = when {
      tabStart < visibleStart + marginPx ->
        max(0f, tabStart - marginPx)
      tabEnd > visibleEnd - marginPx ->
        max(0f, tabEnd - viewportWidthPx + marginPx)
      else -> return
    }

    if (kotlin.math.abs(target - scrollState.value) >= 1f) {
      scrollState.animateScrollTo(target.roundToInt())
    }
  }

  animateScrollToIndex.handle { index ->
    scope.launch { scrollIndexIntoView(index) }.join()
  }

  LaunchedEffect(props.selectedIndex, layouts.toList(), viewportWidthPx) {
    scrollIndexIntoView(props.selectedIndex)
  }

  val selectedColor =
    props.selectedColor.composeOrNull ?: MaterialTheme.colorScheme.primary
  val unselectedColor =
    props.unselectedColor.composeOrNull ?: MaterialTheme.colorScheme.onSurfaceVariant
  val indicatorColor =
    props.indicatorColor.composeOrNull ?: selectedColor

  // Reading ObservableState.value registers Compose snapshot dependency.
  val pagePosition = props.pagePosition?.let { state ->
    (state.value as? Number)?.toFloat()
  } ?: props.selectedIndex.toFloat()

  val clampedPosition = pagePosition.coerceIn(0f, max(props.tabs.size - 1, 0).toFloat())
  val leftIndex = min(clampedPosition.toInt(), max(props.tabs.size - 1, 0))
  val rightIndex = min(leftIndex + 1, max(props.tabs.size - 1, 0))
  val fraction = clampedPosition - leftIndex

  val leftLayout = layouts.getOrNull(leftIndex)
  val rightLayout = layouts.getOrNull(rightIndex)
  val indicatorX =
    if (leftLayout != null && rightLayout != null && leftLayout.width > 0f && rightLayout.width > 0f) {
      lerp(leftLayout.x, rightLayout.x, fraction)
    } else {
      0f
    }
  val indicatorWidth =
    if (leftLayout != null && rightLayout != null && leftLayout.width > 0f && rightLayout.width > 0f) {
      lerp(leftLayout.width, rightLayout.width, fraction)
    } else {
      0f
    }

  Column(
    modifier = ModifierRegistry
      .applyModifiers(props.modifiers, appContext, composableScope, globalEventDispatcher)
      .fillMaxWidth()
      .onSizeChanged { size ->
        viewportWidthPx = size.width.toFloat()
      }
      .horizontalScroll(scrollState)
  ) {
    Column(modifier = Modifier.padding(horizontal = CONTENT_INSET_DP.dp)) {
      Box {
        Row(verticalAlignment = Alignment.CenterVertically) {
          props.tabs.forEachIndexed { index, tab ->
            val isSelected = index == props.selectedIndex
            Column(
              horizontalAlignment = Alignment.CenterHorizontally,
              modifier = Modifier
                .onGloballyPositioned { coordinates ->
                  // Position relative to the Row (indicator coordinate space).
                  val x = coordinates.positionInParent().x
                  val width = coordinates.size.width.toFloat()
                  if (index in layouts.indices) {
                    val next = TabLayoutPx(x = x, width = width)
                    if (layouts[index] != next) {
                      layouts[index] = next
                    }
                  }
                }
                .clickable {
                  onTabSelected(TabSelectedEvent(index = index, id = tab.id))
                }
                .padding(
                  start = TAB_HORIZONTAL_PADDING_DP.dp,
                  top = TAB_VERTICAL_PADDING_TOP_DP.dp,
                  end = TAB_HORIZONTAL_PADDING_DP.dp,
                  bottom = (TAB_VERTICAL_PADDING_BOTTOM_DP + TAB_INDICATOR_HEIGHT_DP).dp
                )
            ) {
              Text(
                text = tab.label,
                color = if (isSelected) selectedColor else unselectedColor,
                style = MaterialTheme.typography.titleMedium.copy(
                  fontWeight = FontWeight.SemiBold,
                  fontSize = 16.sp,
                  lineHeight = 22.sp
                )
              )
            }
          }
        }

        if (indicatorWidth > 0f) {
          Box(
            modifier = Modifier
              .align(Alignment.BottomStart)
              .offset { IntOffset(indicatorX.roundToInt(), 0) }
              .width(with(density) { indicatorWidth.toDp() })
              .height(TAB_INDICATOR_HEIGHT_DP.dp)
              .background(indicatorColor)
          )
        }
      }
    }
  }
}
