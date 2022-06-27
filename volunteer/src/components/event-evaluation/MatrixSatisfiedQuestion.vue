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
        value="Very Satisfied"
      >
        &nbsp;Very Satisfied
      </b-form-radio>
    </b-col>

    <b-col
      class="mb-3"
      cols="12"
    >
      <b-form-radio
        v-model="answer"
        :aria-describedby="ariaDescribedby"
        value="Satisfied"
      >
        &nbsp;Satisfied
      </b-form-radio>
    </b-col>

    <b-col
      class="mb-3"
      cols="12"
    >
      <b-form-radio
        v-model="answer"
        :aria-describedby="ariaDescribedby"
        value="Neutral"
      >
        &nbsp;Neutral
      </b-form-radio>
    </b-col>

    <b-col
      class="mb-3"
      cols="12"
    >
      <b-form-radio
        v-model="answer"
        :aria-describedby="ariaDescribedby"
        value="Dissatisfied"
      >
        &nbsp;Dissatisfied
      </b-form-radio>
    </b-col>

    <b-col
      class="mb-3"
      cols="12"
    >
      <b-form-radio
        v-model="answer"
        :aria-describedby="ariaDescribedby"
        value="Very Dissatisfied"
      >
        &nbsp;Very Dissatisfied
      </b-form-radio>
    </b-col>
  </b-form-group>
</template>

<script>
export default {
  name: 'MatrixSatisfiedQuestion',
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
