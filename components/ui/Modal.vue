<!-- components/ui/Modal.vue -->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" @click.self="$emit('update:modelValue', false)">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <!-- Fondo oscuro -->
          <div class="fixed inset-0 transition-opacity" aria-hidden="true">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              v-if="modelValue"
              class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full"
              :class="{
                'sm:max-w-lg': size === 'lg',
                'sm:max-w-xl': size === 'xl',
                'sm:max-w-2xl': size === '2xl',
                'sm:max-w-4xl': size === '4xl'
              }"
            >
              <!-- Header -->
              <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ title }}
                  </h3>
                  <button
                    @click="$emit('update:modelValue', false)"
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span class="text-2xl leading-none">&times;</span>
                  </button>
                </div>
              </div>

              <!-- Content -->
              <div class="px-6 py-4">
                <slot />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title?: string
  size?: 'lg' | 'xl' | '2xl' | '4xl'
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>