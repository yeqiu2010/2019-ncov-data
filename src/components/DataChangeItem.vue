<template>
  <div class="data-change-item-container">
    <p style="font-size: 12px">较昨日<span :style="{color: data.color}">{{data.changeCount >= 0 ? '+' : '-'}}{{data.changeCount}}</span></p>
    <p><span style="font-size: 24px;font-weight: bold" :style="{color: data.color}">{{data.total}}</span></p>
    <p style="font-size: 14px;font-weight: bold">{{data.name}}</p>
  </div>
</template>

<script>
  export default {
    name: "DataChangeItem",
    data() {
      return {};
    },
    props: ['data']
  };
</script>

<style scoped>

</style>
