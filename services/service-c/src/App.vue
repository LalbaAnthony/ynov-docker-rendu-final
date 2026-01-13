<script setup>
import { ref, onMounted } from "vue";

const serviceA = ref(null);
const serviceB = ref(null);

const fetchData = async () => {
  const [a, b] = await Promise.all([
    fetch(`${import.meta.env.VITE_SERVICE_A_URL}`).then(r => r.json()),
    fetch(`${import.meta.env.VITE_SERVICE_B_URL}`).then(r => r.json())
  ]);

  serviceA.value = a;
  serviceB.value = b;
};

onMounted(fetchData);
</script>

<template>
  <div style="padding: 2rem">
    <h1>Service C (Vue)</h1>

    <h2>Service A</h2>
    <pre>{{ serviceA }}</pre>

    <h2>Service B</h2>
    <pre>{{ serviceB }}</pre>
  </div>
</template>