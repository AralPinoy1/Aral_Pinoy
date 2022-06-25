<template>
  <div style="background-color: white">
    <div class="wp-block-cover is-style-bottom-wave">
      <div class="bg">
        <div class="wp-block-cover__inner-container">
          <div class="image">
            <img
              :src="logo"
              style="width: 420px; height: 240px"
            >
          </div>
        </div>
      </div>
    </div>

    <div class="events">
      <b-container>
        <p class="text">
          Events
        </p>

        <b-row class="mt-2 mb-4">
          <b-col cols="12">
            <b-card>
              <b-container>
                <b-row
                  align-h="around"
                  align-v="center"
                >
                  <b-col cols="4">
                    <b-row align-v="center">
                      <b-col cols="3">
                        <label
                          for="per-page-select"
                          style="font-size: 15px; font-family:'Bebas Neue', cursive;"
                        >
                          Per Page&nbsp;&nbsp;
                        </label>
                      </b-col>

                      <b-col>
                        <select
                          v-model="eventsPagination.perPage"
                          class="form-select form-select-sm"
                          aria-label="Default select example"
                        >
                          <option
                            v-for="option in pageOptions"
                            :key="option"
                          >
                            {{ option }}
                          </option>
                        </select>
                      </b-col>
                    </b-row>
                  </b-col>

                  <b-col cols="4">
                    <b-row align-v="center">
                      <b-col cols="3">
                        <label
                          for="filter-eventName"
                          style="font-size: 15px; font-family:'Bebas Neue', cursive;"
                        >
                          Search&nbsp;&nbsp;
                        </label>
                      </b-col>

                      <b-col>
                        <b-form-input
                          id="filter-eventName"
                          v-model="searchFilter"
                          class="form-control"
                          type="search"
                          size="sm"
                          debounce="500"
                        />
                      </b-col>
                    </b-row>
                  </b-col>
                </b-row>
              </b-container>
            </b-card>
          </b-col>
        </b-row>

        <b-row class="pb-4">
          <template v-if="isLoadingEvents">
            <b-col
              v-for="index in [0, 1, 2]"
              :key="index"
              cols="12"
              md="4"
            >
              <b-card no-body>
                <b-skeleton-img height="350px" />
              </b-card>
            </b-col>
          </template>

          <template v-else>
            <b-col
              v-for="event in events.results"
              :key="event._id"
              class="pb-4"
              cols="12"
              md="4"
            >
              <b-card
                class="mb-2"
                :img-src="event.logoUrl !== undefined ? event.logoUrl : noImageSrc"
                img-height="300px"
                img-alt="Image"
                style="text-align: left; cursor: pointer; min-height: 600px"
                @click="$router.push(`/events/${event._id}`)"
              >
                <h4>
                  <b-link :to="`/events/${event._id}`">
                    {{ event.name }}
                  </b-link>
                </h4>

                <b-card-text v-if="event.description !== undefined">
                  {{
                    event.description.length > 175
                      ? `${event.description.substring(0, 175)}...`
                      : event.description
                  }}
                </b-card-text>

                <b-row style="text-align: left">
                  <b-col
                    v-if="event.location !== undefined"
                    class="pb-2"
                    cols="12"
                  >
                    <b-icon icon="geo-alt" /> {{ event.location.name }}
                  </b-col>

                  <b-col
                    class="pb-2"
                    cols="12"
                  >
                    <b-icon icon="calendar" />
                    {{
                      new Date(event.date.start).toLocaleString('en-us', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })
                    }}
                    -
                    {{
                      isSameDay(event.date.start, event.date.end)
                        ? new Date(event.date.end).toLocaleString('en-us', {
                          timeStyle: 'short'
                        })
                        : new Date(event.date.end).toLocaleString('en-us', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })
                    }}
                  </b-col>

                  <b-col
                    class="pb-3"
                    cols="12"
                  >
                    <b-icon icon="clock" /> {{ getDurationBetweenDates(event.date.start, event.date.end) }}
                  </b-col>
                </b-row>

                <b-row v-if="event.goals.monetaryDonation.target !== 0">
                  <b-col cols="12">
                    <b-progress
                      height="1.5rem"
                      :max="event.goals.monetaryDonation.target"
                    >
                      <b-progress-bar
                        variant="success"
                        :value="event.goals.monetaryDonation.current"
                        :label="getMonetaryDonationCurrentLabel(event.goals.monetaryDonation)"
                      />

                      <b-progress-bar
                        variant="danger"
                        :value="hasGoalReached(event.goals.monetaryDonation) ? 0 : event.goals.monetaryDonation.target"
                        :label="getMonetaryDonationTargetLabel(event.goals.monetaryDonation)"
                      />
                    </b-progress>
                  </b-col>
                </b-row>

                <b-row v-if="event.goals.numVolunteers.target !== 0">
                  <b-col
                    class="pt-2"
                    cols="12"
                  >
                    <b-progress
                      height="1.5rem"
                      :max="event.goals.numVolunteers.target"
                    >
                      <b-progress-bar
                        variant="success"
                        :value="event.goals.numVolunteers.current"
                        :label="getVolunteerGoalCurrentLabel(event.goals.numVolunteers)"
                      />

                      <b-progress-bar
                        variant="danger"
                        :value="hasGoalReached(event.goals.numVolunteers) ? 0 : event.goals.numVolunteers.target"
                        :label="getVolunteerGoalTargetLabel(event.goals.numVolunteers)"
                      />
                    </b-progress>
                  </b-col>
                </b-row>
              </b-card>
            </b-col>

            <b-col cols="12">
              <b-pagination
                v-model="eventsPagination.currentPage"
                :total-rows="events.total"
                :per-page="eventsPagination.perPage"
                align="fill"
                size="sm"
              />
            </b-col>
          </template>
        </b-row>
      </b-container>
    </div>

    <Footer />
  </div>
</template>

<script>
import {
  isSameDay,
  intervalToDuration,
  formatDuration
} from 'date-fns'

import Footer from '../../components/Footer.vue'

import EventRepository from '../../repositories/events'
import { apiClient } from '../../axios'

const logo = require('../../assets/aralpinoywords.png')

const eventRepository = new EventRepository(apiClient)

export default {
  components: {
    Footer
  },
  data () {
    return {
      logo,
      isLoadingEvents: false,
      searchFilter: '',
      pageOptions: [6, 12, 18],
      events: {
        results: [],
        total: 0
      },
      eventsPagination: {
        currentPage: 1,
        perPage: 6
      }
    }
  },
  computed: {
    eventsPaginationOffset () {
      return (this.eventsPagination.currentPage - 1) * this.eventsPagination.perPage
    },
    noImageSrc () {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/No_image_available_600_x_450.svg/1280px-No_image_available_600_x_450.svg.png'
    }
  },
  watch: {
    searchFilter () {
      this.getEvents()
    },
    'eventsPagination.perPage' () {
      this.getEvents()
    },
    'eventsPagination.currentPage' () {
      this.getEvents()
    }
  },
  created () {
    this.getEvents()
  },
  methods: {
    async getEvents () {
      this.isLoadingEvents = true

      const limit = this.eventsPagination.perPage
      const offset = this.eventsPaginationOffset

      try {
        const { results, total } = await eventRepository.list({
          name: this.searchFilter,
          status: 'UPCOMING'
        }, {
          limit,
          offset,
          sort: {
            field: 'date.start',
            order: 'asc'
          }
        })

        this.events.results = results
        this.events.total = total
      } finally {
        this.isLoadingEvents = false
      }
    },
    isSameDay (firstDate, secondDate) {
      return isSameDay(new Date(firstDate), new Date(secondDate))
    },
    hasGoalReached ({ current, target }) {
      return current >= target
    },
    getMonetaryDonationCurrentLabel ({ current, target }) {
      if (current >= target) {
        const currentCurrency = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'PHP'
        }).format(current)

        const targetCurrency = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'PHP'
        }).format(target)

        return `We have reached our goal! (${currentCurrency} / ${targetCurrency})`
      }

      const currency = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP'
      }).format(current)

      return currency
    },
    getMonetaryDonationTargetLabel ({ current, target }) {
      if (current >= target) {
        return ''
      }

      const difference = target - current
      const currency = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP'
      }).format(difference)

      return `We still need ${currency} to reach our goal!`
    },
    getVolunteerGoalCurrentLabel ({ current, target }) {
      if (current >= target) {
        return `We have reached our goal! (${current} / ${target} have volunteered)`
      }

      const volunteerNoun = current === 1 ? 'volunteer' : 'volunteers'

      return `${current} ${volunteerNoun}`
    },
    getVolunteerGoalTargetLabel ({ current, target }) {
      if (current >= target) {
        return ''
      }

      const difference = target - current
      const volunteerNoun = difference === 1 ? 'volunteer' : 'volunteers'

      return `We still need ${difference} ${volunteerNoun}!`
    },
    getDurationBetweenDates (start, end) {
      const duration = intervalToDuration({
        start: new Date(start),
        end: new Date(end)
      })

      return formatDuration(duration)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap');

.bg {
  background-image: linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)),
  url('https://miro.medium.com/max/6300/1*yBLzf7yS7m_GTfLD6oCvzg.jpeg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: block;
  position:relative;
  left:0px;
  top:0px;
  width: 100%;
  height: 50%;
  z-index:-1;
}
.image {
  padding-top: 45px;
  padding-bottom: 45px;
}
.events {
  background: white;
}
.text {
  color: black;
  font-family: 'Bebas Neue', cursive;
  font-size: 50px;
  text-align: left;
  padding-top: 18px;
}
.wp-block-cover:not(.components-placeholder):not(.is-placeholder).is-style-bottom-wave {
  mask-image: url('data:image/svg+xml;utf8,<svg width="235" height="248" xmlns="http://www.w3.org/2000/svg"><path d="M250 220.092145s-12.873712-8.581631-26.547345-11.208661c-13.673633-2.62703-19.948005-2.014057-25.847415-1.094596-14.723528 2.276759-29.197081 7.662171-48.145186 21.760565-7.399261 5.341628-19.223078 13.485421-25.122488 15.630829-5.999399 2.145408-13.223677 3.415139-18.873112 2.320543-2.574743-.437838-5.6494355-.612974-12.4487556-3.371355-6.8743126-2.62703-14.6235377-7.049197-19.9230076-10.595688-10.2989701-6.874062-23.6976303-9.501092-33.4966504-9.807579C17.9982002 222.806743 0 237.080273 0 237.080273V0h250z"/></svg>');
  mask-position: bottom;
  mask-repeat: no-repeat;
  mask-size: cover;
}
</style>
