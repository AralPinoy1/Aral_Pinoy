<template>
  <b-form-group
    v-slot="{ ariaDescribedby }"
    :label="question.label"
  >
    <b-col
      class="mb-3"
      cols="12"
    >
      <b-form-radio
        v-model="answer"
        :aria-describedby="ariaDescribedby"
        :value="1"
      >
        &nbsp;Yes
      </b-form-radio>
    </b-col>

    <b-col
      class="mb-3"
      cols="12"
    >
      <b-form-radio
        v-model="answer"
        :aria-describedby="ariaDescribedby"
        :value="0"
      >
        &nbsp;No
      </b-form-radio>
    </b-col>
  </b-form-group>
</template>

<script>
export default {
  name: 'PolarQuestion',
  props: {
    question: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      answer: null
    }
  },
  watch: {
    answer (value) {
      this.$emit('answer-updated', {
        question: {
          label: this.question.label,
          type: this.question.type
        },
        answer: value
      })
    }
  }
}
</script>
