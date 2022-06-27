<template>
  <div>
    <b-container>
      <b-row class="py-4">
        <b-col cols="12">
          <b-card
            bg-variant="light"
            style="border-radius: 20px;"
          >
            <h3 style="font-family:'Bebas Neue', cursive; color: black; position: relative;">
              Forms
            </h3>

            <b-container fluid>
              <b-row>
                <b-col cols="12">
                  <b-list-group style="text-align: left">
                    <b-list-group-item class="mb-4 flex-column align-items-start">
                      <div class="d-flex w-100 justify-content-between">
                        <div>
                          <h5 class="mb-1">
                            Incidents Form
                          </h5>

                          <p class="mb-1">
                            Downloads the form for listing down incidents for events
                          </p>
                        </div>

                        <button
                          class="btn btn-danger"
                          type="button"
                          @click="downloadIncidentsForm"
                        >
                          <span>
                            Download
                          </span>
                        </button>
                      </div>
                    </b-list-group-item>
                  </b-list-group>
                </b-col>

                <b-col cols="12">
                  <b-list-group style="text-align: left">
                    <b-list-group-item class="mb-4 flex-column align-items-start">
                      <div class="d-flex w-100 justify-content-between">
                        <div>
                          <h5 class="mb-1">
                            Review Form
                          </h5>

                          <p class="mb-1">
                            Downloads the form for writing a review for an event
                          </p>
                        </div>

                        <button
                          class="btn btn-danger"
                          type="button"
                          @click="downloadReviewForm"
                        >
                          <span>
                            Download
                          </span>
                        </button>
                      </div>
                    </b-list-group-item>
                  </b-list-group>
                </b-col>
              </b-row>
            </b-container>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import config from '../../config'

const incidentsFormUrl = new URL('/form-templates/static/incidents-form', config.api.baseUrl)
const reviewFormUrl = new URL('/form-templates/static/review-form', config.api.baseUrl)

export default {
  name: 'Forms',
  methods: {
    async downloadIncidentsForm () {
      window.open(incidentsFormUrl.toString(), '_blank')
    },
    async downloadReviewForm () {
      window.open(reviewFormUrl.toString(), '_blank')
    }
  }
}
</script>
