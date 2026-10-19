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
      <!-- 🔥 z-[99999] para que nada lo tape -->
      <div v-if="modelValue" class="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-0">
        
        <!-- Fondo oscuro clickeable -->
        <div 
          class="absolute inset-0 bg-gray-500/75 transition-opacity" 
          aria-hidden="true" 
          @click="$emit('update:modelValue', false)"
        ></div>

        <!-- Contenedor del Modal -->
        <div 
          class="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full flex flex-col max-h-[90vh]"
          :class="{
            'sm:max-w-lg': size === 'lg',
            'sm:max-w-xl': size === 'xl',
            'sm:max-w-2xl': size === '2xl',
            'sm:max-w-4xl': size === '4xl'
          }"
          @click.stop
        >
          <!-- Header -->
          <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 flex-shrink-0">
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

          <!-- Contenido con scroll -->
          <div class="px-6 py-4 overflow-y-auto">
            <slot />
          </div>
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