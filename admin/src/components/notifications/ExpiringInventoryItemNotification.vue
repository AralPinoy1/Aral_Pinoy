<template>
  <div>
    <b-list-group-item
      v-b-visible="visibleHandler"
      :variant="notification.seen ? 'secondary': ''"
      class="d-flex align-items-center"
      button
      @click="read()"
    >
      <b-avatar
        icon="hourglass-bottom"
        class="mr-5"
      />

      <div
        class="flex-column w-100 align-items-start"
        style="margin-left: 15px"
      >
        <div class="d-flex justify-content-between">
          <h5 class="mb-1">
            Items in your inventory are almost expiring!
          </h5>
          <small>{{ notificationDate }}</small>
        </div>

        <small class="mb-1">
          <strong>{{ getItemNames() }}</strong> will be expiring on or before
          <strong>{{ new Date(details.dateThreshold).toLocaleString('en-us', { month: 'short', year: 'numeric' }) }}</strong>.
        </small>
      </div>
    </b-list-group-item>

    <expiring-inventory-items-modal
      :show="modal"
      :inventory-items="details.expiringItems"
      @close="modal = false"
    />
  </div>
</template>

<script>
import { formatDistanceToNow } from 'date-fns'

import ExpiringInventoryItemsModal from './ExpiringInventoryItemsModal'

export default {
  name: 'ExpiringInventoryItemNotification',
  components: {
    ExpiringInventoryItemsModal
  },
  props: {
    notification: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      modal: false
    }
  },
  computed: {
    details () {
      return this.notification.typeDetails
    },
    notificationDate () {
      const date = new Date(this.notification.createdAt)

      return formatDistanceToNow(date, {
        includeSeconds: true,
        addSuffix: true
      })
    }
  },
  methods: {
    read () {
      const id = this.notification._id

      this.$emit('onRead', {
        id
      })

      this.modal = true
    },
    visibleHandler (isVisible) {
      if (this.notification.seen) {
        return
      }

      if (isVisible) {
        this.$emit('onVisible')
      }
    },
    getItemNames () {
      const expiringItems = this.details.expiringItems

      if (expiringItems.length === 1) {
        const item = expiringItems[0]

        return `${item.name}`
      }

      if (expiringItems.length === 2) {
        const [firstItem, secondItem] = expiringItems

        return `${firstItem.name} and ${secondItem.name}`
      }

      if (expiringItems.length === 3) {
        const [firstItem, secondItem, thirdItem] = expiringItems

        return `${firstItem.name}, ${secondItem.name}, and ${thirdItem.name}`
      }

      return `${expiringItems[0].name}, ${expiringItems[1].name}, and ${expiringItems.length - 2} others`
    }
  }
}
</script>
