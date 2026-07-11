package expo.modules.progresssnackbar

import android.graphics.Color
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.types.OptimizedRecord
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.FunctionalComposableScope
import expo.modules.kotlin.views.OptimizedComposeProps
import expo.modules.ui.ModifierList
import expo.modules.ui.ModifierRegistry
import expo.modules.ui.composeOrNull
import kotlinx.coroutines.delay
import java.util.concurrent.atomic.AtomicBoolean

@OptimizedRecord
data class SnackbarFinishedEvent(
  @Field val reason: String = "timeout",
  @Field val token: Int = 0
) : Record

@OptimizedComposeProps
data class ProgressSnackbarProps(
  /** Empty message hides the snackbar. */
  val message: String = "",
  /** "success" | "error" */
  val variant: String = "success",
  val durationMs: Int = 4000,
  /** Bump to restart the progress timer for the same message. */
  val token: Int = 0,
  val successAccentColor: Color? = null,
  val errorAccentColor: Color? = null,
  val containerColor: Color? = null,
  val contentColor: Color? = null,
  val modifiers: ModifierList = emptyList()
) : ComposeProps

@Composable
fun FunctionalComposableScope.ProgressSnackbarContent(
  props: ProgressSnackbarProps,
  onFinished: (SnackbarFinishedEvent) -> Unit
) {
  val visible = props.message.isNotBlank()
  val isError = props.variant.equals("error", ignoreCase = true)
  val durationMs = props.durationMs.coerceIn(1000, 15_000)

  val progress = remember(props.token) { Animatable(1f) }
  val finished = remember(props.token) { AtomicBoolean(false) }

  fun emitFinished(reason: String) {
    if (finished.compareAndSet(false, true)) {
      onFinished(SnackbarFinishedEvent(reason = reason, token = props.token))
    }
  }

  LaunchedEffect(props.token, props.message, props.variant, durationMs) {
    if (!visible) {
      progress.snapTo(1f)
      return@LaunchedEffect
    }
    progress.snapTo(1f)
    progress.animateTo(
      targetValue = 0f,
      animationSpec = tween(durationMillis = durationMs, easing = LinearEasing)
    )
    delay(80)
    emitFinished("timeout")
  }

  val accent =
    if (isError) {
      props.errorAccentColor.composeOrNull ?: MaterialTheme.colorScheme.error
    } else {
      props.successAccentColor.composeOrNull ?: MaterialTheme.colorScheme.secondary
    }

  val container =
    props.containerColor.composeOrNull
      ?: MaterialTheme.colorScheme.inverseSurface

  val content =
    props.contentColor.composeOrNull
      ?: MaterialTheme.colorScheme.inverseOnSurface

  val shape = RoundedCornerShape(12.dp)

  Box(
    modifier = ModifierRegistry
      .applyModifiers(props.modifiers, appContext, composableScope, globalEventDispatcher)
      .fillMaxWidth()
  ) {
    AnimatedVisibility(
      visible = visible,
      enter = fadeIn(animationSpec = tween(180)),
      exit = fadeOut(animationSpec = tween(220))
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 16.dp)
          .clip(shape)
          .background(container)
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(start = 16.dp, end = 4.dp, top = 10.dp, bottom = 10.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = props.message,
            color = content,
            style = MaterialTheme.typography.bodyMedium,
            maxLines = 3,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier
              .weight(1f)
              .padding(end = 8.dp)
          )
          IconButton(onClick = { emitFinished("dismissed") }) {
            Icon(
              imageVector = Icons.Filled.Close,
              contentDescription = "Dismiss",
              tint = content.copy(alpha = 0.85f)
            )
          }
        }

        Box(
          modifier = Modifier
            .fillMaxWidth()
            .height(3.dp)
            .background(accent.copy(alpha = 0.22f))
        ) {
          Box(
            modifier = Modifier
              .fillMaxWidth()
              .height(3.dp)
              .graphicsLayer {
                scaleX = progress.value
                transformOrigin = TransformOrigin(0f, 0.5f)
              }
              .background(accent)
          )
        }
      }
    }
  }
}
