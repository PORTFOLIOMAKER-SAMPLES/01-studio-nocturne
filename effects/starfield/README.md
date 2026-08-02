# starfield — 잔잔히 반짝이는 별하늘 배경

Canvas 2D 별 파티클. 별은 원 하나, 반짝임은 sin 하나 — 셰이더 없이 가볍습니다.
동작 줄이기 사용자에게는 멈춘 별하늘 한 장을 그립니다.

## 바닐라

```html
<section class="fx-starfield" data-fx="starfield" data-fx-density="1.4">
  <h1>Night</h1>
</section>
<script type="module">
  import { mount } from './effects/starfield/index.js';
  mount('.fx-starfield');
</script>
```

## 옵션

| 키 | 기본 | 설명 |
|---|---|---|
| `density` | 1 | 별 밀도(9000px²당 1개 기준 배율) |
| `speed` | 6 | 표류 속도 |
| `twinkle` | 0.6 | 반짝임 세기(0~1) |
| `size` | 1.2 | 별 크기 배율 |
| `color` | `''` | 비우면 흰색 |

어두운 배경 위에서 가장 좋습니다(밝은 테마에서는 색을 지정하세요).
